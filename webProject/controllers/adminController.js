const bcrypt = require('bcrypt');
const Admin = require("../models/adminModels");
const Patient = require("../models/patientsModels");
const Provider = require("../models/providersModels");
const saltRounds = 10;


class adminController {

    // Sign-Up
    static async signUp(req, res) {
        try {
            const {  name, admin_code, email, password } = req.body;
            //const userData = { first_name, last_name, email, password }
            
            if (!name || !admin_code || !email || !password) {
                return res.status(400).json({ error: 'All fields are required.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log(hashedPassword)

            await Admin.create([name, admin_code, email, hashedPassword])
            req.flash('success', 'Successfuly Signed Up');
            res.redirect('/account/admin_a');

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

            const users = await Admin.emailRead([email]);
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

                // Store user in the new session
                req.session.user = {
                    id: user.admin_id,
                    name: user.name,
                    code: user.admin_code,
                    email: user.email,
                };
                req.flash('success', 'Successfully Logged in');
                res.redirect('/admins/dashboard');

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
        const providerId = req.session.user.id
        
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Could not log out.' });
            }
            res.redirect('/account/provider_a');
        });

        } catch (error) {
        console.log(error);
        }

    }

    // Delete appointment
    static async deleteUsersAppointment(req, res) {
        try {
            const { appointment_id } = req.body;
            
            if (!appointment_id) {
                return res.status(400).json({ error: 'appointment_id is required.' });
            }

            await Admin.admDelelteAppointment(appointment_id)
            req.flash('success', 'Successfully deleted ');
            res.redirect('/admins/appointments');

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    //Delete a patient
    static async deletePatient(req, res) {
        try {
            const { patient_id } = req.body;
            console.log(patient_id)
            const patientId = { patient_id }
            console.log(patientId)

        if (!patientId ) {
            return res.status(400).json({ error: 'patient_id is required.' });
        }
            
        const pDel = await Patient.patientDeleteAccount( patientId)
        console.log(pDel)
        req.flash('success', 'Successfully deleted ');
        res.redirect('/admins/dashboard');

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    //Delete a provider
    static async deleteProviders(req, res) {
        try {
            const { provider_id } = req.body;
            const providerId = { provider_id }
            if (!providerId) {
                return res.status(400).json({ error: 'provider_id is required.' });
            }
                
            await Provider.deleteProvider(providerId)
            req.flash('success', 'Successfully deleted ');
            res.redirect('/admins/dashboard');

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    // Providers verification
    static async providerVerificationUpdate(req, res) {
        try {
            const { provider_id, action } = req.body;
            console.log("Appointment ID:", provider_id);
            console.log("Action:", action)
            const verify = action === 'verified' ? 'verified' : 'declined';
            console.log("verification:", action);

            await Admin.verifyProvider([provider_id, verify])
            req.flash('success', `Account ${action}`);
            res.redirect('/admins/dashboard');

        } catch (error) {
            console.log(error)
            req.flash('error', 'Failed to update appointment');
            return res.redirect('/providers/provider_dashboard');
           // return res.status(500).json({ error: error.message });
        }
    }

    // Fetch lists of appointments with provider and patient
    static async appointmentsBtwPatientsAndProviders(req, res) {
        try {
            const { provider_id, patient_id, status } = req.query;
            
            

            const appointments = await Admin.providersPatientsAppointments([provider_id, patient_id, status])
            
            
            res.render('appointments', {
                user: req.session.user,
                appointments,
                provider_id,
                patient_id,
                status
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    // Dashboard
    static async admDashboard(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/account/admin_a');
            }

            // Appointment status counts
            const statusCountsResult = await Admin.appointmentStatusCount()
            const statusCounts = statusCountsResult[0];

            // Fetch all patients
            const patients = await Admin.getAllPatients()

            // Fetch all patients without appointment
            const patientsWithoutAppointment = await Admin.getAllPatientsWithoutAppointment()

            // Fetch all patients with appointment
            const patientsWithAppointment = await Admin.getAllPatientsWithAppointment()

            // Fetch all providers
            const providers = await Admin.getAllProviders()

            // Fetch all providers without appointment
            const  providersWithoutAppointment = await Admin.getAllProvidersWithoutAppointment()

            // Fetch all providers with appointment
            const providersWithAppointment = await Admin.getAllProvidersWithAppointment()

            // Fetch number of patients per provider
            const patientsPerProvider = await Admin.numberOfPatientsPerProvider()

            // Fetch number of providers per patient
            const providersPerPatient = await Admin.numberOfProvidersPerPatient()

            // Render / View
            res.render('dashb', {
                user: req.session.user,
                patients,
                patientsWithoutAppointment,
                patientsWithAppointment,
                providers,
                providersWithoutAppointment,
                providersWithAppointment,
                statusCounts: statusCounts,
                patientsPerProvider,
                providersPerPatient
            });


        } catch (error) {
            console.log(error)
        }
    }


}

module.exports = adminController