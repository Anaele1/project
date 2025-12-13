const bcrypt = require('bcrypt');
const Patient = require("../models/patientsModels");
const accountAuth = require("../models/usersModels");
const saltRounds = 10;

class patientsController {

    // Sign-Up
    static async signUp(req, res) {
        try {
            const { first_name, last_name, email, password } = req.body;
            //const userData = { first_name, last_name, email, password }
            
            if ( !first_name || !last_name || !email || !password) {
                return res.status(400).json({ error: 'All fields are required.' });
            }


            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log(hashedPassword)

            await accountAuth.create([ first_name, last_name, email, hashedPassword])
            req.flash('success', 'Successfuly Signed Up');
            res.redirect('/account/provider_a');

        } catch (error) {
          console.log(error)
          console.error(' db query error:', {
            message: error.message,
            stack: error.stack,
            context: error.sql ? {sql: error.sql, query: 'accountCreate'} : null
          })
            req.flash('error', 'Failed to create account');
            return res.redirect('/account');
        //   res.status(500).json({
        //     success: false,
        //     message: 'Check your data inputs',
        //     errorCode: '',
        //   })
        }   
    }

    // Sign-In
    static async signIn(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required.' });
            }

            const users = await accountAuth.emailRead([email]);
            console.log(users)
            if (!users || users.length === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }
            
            const user = users[0];
            if (!user.password) {
                return res.status(400).json({ error: 'User has no password set.' });
            }
    
            const match = await bcrypt.compare(password, user.password);
            console.log(match, 'match')
            if (!match) {
                return res.status(400).json({ error: 'Invalid password.' });
            }
    
            req.session.regenerate(err => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Error regenerating session.' });
                }
                req.session.user = {
                    id: user.patient_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    language: user.language,
                    location: user.location,
                    availability: user.availability,
                };
                req.flash('success', 'Successfully Logged in');
                res.redirect('/patients/patient_dashboard');
            });
        } catch (error) {
            console.error('Error:', error);
            req.flash('error', 'Failed to log in');
            return res.redirect('/account');
        }
    }
    
    // Logout
    static async logout(req, res) {
        try {
            const users = req.session.user.id;
            await accountAuth.availability(users)
            //Session Logout
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ error: 'Could not log out.' });
                }
                res.redirect('/account/users_patient_a');
            });
        } catch (error) {
            console.log(error)
        }
    }
    
    //Booking appointment
    static async bookAppointment(req, res) {
        try {
            const { providerId, date, time } = req.body; 
            const patientId = req.session.user.id;
            console.log(providerId, 'provid')
            console.log(patientId)
            const exist = await Patient.findExistingAppointment([providerId, patientId])
    

            // If an appointment already exists
            if (exist.length > 0) {
                req.flash('error', 'You already have an appointment with this provider.');
                return res.redirect('/patients/patient_dashboard');
            }

            await Patient.patientCreateAppointment([patientId, providerId, date, time])
            // if (err) {
            //     console.log(err);
            //     req.flash('error', 'Failed to book appointment');
            //     return res.redirect('/patients/patient_dashboard');
            // }
            req.flash('success', 'Appointment request sent!');
            res.redirect('/patients/patient_dashboard');
    
        } catch (error) {
          console.log(error)
          console.error(' db query error:', {
            message: error.message,
            stack: error.stack,
            context: error.sql ? {sql: error.sql, query: 'Patient.getAll() or Patient.getAllP()'} : null
          })
            req.flash('error', 'Failed to book appointment');
            return res.redirect('/patients/patient_dashboard');
        //   res.status(500).json({
        //     success: false,
        //     message: '',
        //     errorCode: '',
        //   })
        }   
    }
     
    // Location Update
    static async editLocation(req, res) {
        try {
            const { patientId, location } = req.body;   
            if (!patientId || !location) {
            req.flash('error', 'Patient ID or location column are required.');
            return res.redirect('/patients/patientProfile');
            }

            await Patient.updateLocation([ location, patientId])
            req.flash('success', 'location added successfully.');
            res.redirect('/patients/patientProfile');

        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to add location.');
            return res.redirect('/patients/patientProfile');
        }
    }

    // Language Update
    static async editLanguage(req, res) {
        try {
            const { patientId, language } = req.body;
            
            if (!patientId || !language) {
            req.flash('error', 'Patient ID or location column are required.');
            return res.redirect('/patients/patientProfile');
            }

            await Patient.updateLanguage([language, patientId])
            req.flash('success', 'language added successfully.');
            res.redirect('/patients/patientProfile');

        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to update your language.');
            return res.redirect('/patients/patientProfile');
        }
    }

    // Delete account
    static async accountDelete(req, res) {
        try {
            const { patientId } = req.body;
            
            if (!patientId) {
                req.flash('error', 'Patients ID is required.');
                return res.redirect('/patients/patientProfile');
            }

            await Patient.patientDeleteAppointment(patientId)

            await Patient.patientDeleteAccount(patientId)
            req.flash('Account Successfully DELETED.');
            console.log(`Account has been deleted for: ${patientId} `)
            res.redirect('/')
            
            // req.session.destroy(err => {
            //     if (err) {
            //         console.log(err);
            //         req.flash('error', 'Failed to log out.');
            //         return res.redirect('/patients/patientProfile');
            //     }
            //     req.flash('success', 'Account deleted successfully.');
            //     res.redirect('/');
            // });

        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to delete account.');
            return res.redirect('/patients/patientProfile');
        }
    }

    // Number of Providers per Patient
    static async patientDashboard(req, res) {
        try {
            const patientId = req.session.user.id;
            console.log(patientId)

            const providerCountResult = await Patient.numberOfProvidersPerPatient(patientId)
            const providerCount = providerCountResult[0].provider_count;

            const statusCountsResult = await Patient.appointmentStatusCount(patientId)
            console.log(statusCountsResult)
            const statCounts = statusCountsResult[0];

            const availability = await Patient.availabilityUpdate(patientId)
            const availabilityStatus = availability;

            //Session Render
            res.render('patientsDashboard', {
                user: req.user,
                user: req.session.user,
                availabilityStatus,
                providerCount,
                backgroundColor: req.session.backgroundColor, 
                textColor: req.session.textColor,
                statCounts: statCounts,
                status: 'status',
                messages: req.flash()
            });
            
        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to login into dashboad.');
            return res.redirect('/patients/patientProfile');
        }
    }

    // Appointments Status Filter
    static async appointmentStatus(req, res) {
        try {
            const patientId = req.session.user.id
            const status = req.query.status || 'pending';
            if (!['pending', 'accepted', 'cancelled',].includes(status)) {
                req.flash('error', 'Invalid status');
                return res.redirect('/patients/patient_dashboard');
            }

            const appointments = await Patient.appointmentStatusCheck([patientId, status])
            
            res.render('usersAppointment', {
                status: status,
                provider: '',
                appointments: appointments,
                backgroundColor: req.session.backgroundColor, 
                textColor: req.session.textColor,
                user: req.session.user,
                type: 'appointmentss',
                messages: req.flash(),
            });

        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to check for appointment statsus');
            return res.redirect('/patients/patient_dashboard');
        }
    }

    // Providers List
    static async providersList(req, res) {
        try {
            const providers = await Patient.verifiedProviders()
            
            res.render('usersAppointment', { 
                specialty: '', 
                providers, 
                appointments: '', 
                type: 'providerss', 
                status: '', 
                user: req.session.user, 
                messages: req.flash() 
            });
        } catch (error) {
            console.log(error);
            req.flash('error', 'Could not get list of providers.');
            return res.redirect('/patients/patientProfile');
        }
    }

    // Appointments history
    static async appointments(req, res) {
        try {
            const patientId = req.session.user.id 
            const appointments = await Patient.appointmentsWithProviders(patientId)
            res.render('usersAppointment', { 
                specialty: '', 
                providers: '', 
                appointments,
                type: 'appointmentss', 
                status: '', 
                user: req.session.user, 
                messages: req.flash() 
            });
        } catch (error) {
            console.log(error);
            req.flash('error', 'difficulties retrieving providers under you.');
            return res.redirect('/patients/patientProfile');
        }
    }

    //Chat router
    static async chat(req, res) {
        try {
            res.render('chat', { 
                backgroundColor: req.session.backgroundColor, 
                textColor: req.session.textColor 
            })
        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to add location.');
            return res.redirect('/patients/patientProfile');
        }
    }

    // Profile
    static async profile(req, res) {
        try {
            console.log(req.user);
            res.render('patientsProfile', { user: req.user });
        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to add location.');
            return res.redirect('/patients/patientProfile');
        }
    }

    // Appointment response 
    static async appointmentResponse(req, res) {
        try {
            const { appointmentId, action } = req.body;
            const status = action === 'accept' ? 'accepted' : 'cancelled';
            await accountAuth.appointmentStatusUpdate([status, appointmentId]);
            req.flash('success', `Appointment ${status}`);
            res.redirect('/patients/patient_dashboard');
        } catch (error) {
            console.log(error);
            req.flash('error', 'Failed to update appointment');
            res.redirect('/patients/patient_dashboard');
        }
    }
}


module.exports = patientsController;