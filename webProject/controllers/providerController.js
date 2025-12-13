const bcrypt = require('bcrypt');
const Provider = require('../models/providersModels');
const saltRounds = 10;



class providerController {

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

        await Provider.create([ first_name, last_name, email, hashedPassword])
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

          const users = await Provider.emailRead([email]);
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
              id: user.provider_id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              specialty: user.specialty,
              verify: user.verify,
              language: user.language,
              location: user.location,
              availability: user.availability,
            };
            req.flash('success', 'Successfully Logged in');
            res.redirect('/providers/provider_dashboard');

          });

      } catch (error) {
          console.error('Error:', error);
          req.flash('error', 'Failed to log in');
          return res.redirect('/account');
      }
  }

  // Provider specialty update
  static async editSpecialty(req, res) {
    try {
      const { providerId, specialty } = req.body;   
      if (!providerId || !specialty) {
        req.flash('error', 'Provider ID and specialty are required.');
        return res.redirect('/providers/provider_dashboard');
      }

      await Provider.specialtyUpdate([specialty, providerId])
      req.flash('success', 'Specialty updated successfully.');
      res.redirect('/providers/providerProfile');

    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to update specialty.');
      return res.redirect('/providers/provider_dashboard');
    }
  }

  // Provider location update
  static async editLocation(req, res) {
    try {
      const { providerId, location  } = req.body;   
      if (!providerId || !location) {
        req.flash('error', 'Provider ID or location column are required.');
        return res.redirect('/providers/provider_dashboard');
      }

      await Provider.locationUpdate([ location, providerId])
      req.flash('success', 'Specialty updated successfully.');
      res.redirect('/providers/providerProfile');

    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to add location.');
      return res.redirect('/providers/provider_dashboard');
    }
  }

  // Provider language update
  static async editLanguage(req, res) {
    try {
      const { providerId, language  } = req.body;   
      if (!providerId || !language) {
        req.flash('error', 'Provider ID or language column are required.');
        return res.redirect('/providers/provider_dashboard');
    }

      await Provider.languageUpdate([language, providerId])
      req.flash('success', 'language added successfully.');
        res.redirect('/providers/providerProfile');

    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to add language.');
      return res.redirect('/providers/provider_dashboard');
    }
  }

  // Delete account
  static async providerAccountDelete(req, res) {
    try {
      const { providerId } = req.body;

      if (!providerId) {
        req.flash('error', 'Provider ID is required.');
        return res.redirect('/providers/provider_dashboard');
      }

      await Provider.deleteAppointment(providerId)
      await Provider.deleteProvider(providerId)
      req.flash(`Account has been deleted for: ${providerId}`);
      res.redirect('/');

    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to delete account.');
      return res.redirect('/providers/provider_dashboard');
    }
 
  }

  // Provider Dashboard
  static async dashboard(req, res) {
    try {

      const providerId = req.session.user.id;

      const patientCountResult = await Provider.patientsPerProvider(providerId)
      const patientCount = patientCountResult[0].patient_count;

      const statusCountsResult = await Provider.appointmentStatusCount(providerId)
      const statCounts = statusCountsResult[0];

      const availability = await Provider.availabilityOnline(providerId)
      const availabilityStatus = availability;

      res.render('providersDashboard', {
        user: { ...req.session.user},
        patientCount,
        specialty: '',
        status: '',
        availabilityStatus: '',
        statCounts: statCounts,
        appointments: '',
        messages: req.flash('Logged In Successful')
      });


    } catch (error) {
      console.log(error);
      req.flash('error', 'Failled to login into dashboard.');
      return res.redirect('/providers');
    }
 
  }

  // Providers appointments
  static async providerAppointments(req, res) {
    try {

      const providerId = req.session.user.id;
      const status = req.query.status || 'pending';
      if (!['pending', 'accepted', 'cancelled'].includes(status)) {
          req.flash('error', 'Invalid status');
          return res.redirect('/providers/provider_dashboard');
      }

      const appointments = await Provider.appointmentStatusFilter([providerId, status])

      res.render('pUsersAppointment', {
        appointments: appointments,
        user: req.session.user,
        messages: req.flash(),
        status: status
      });
      
    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to fetch appointments');
      return res.redirect('/providers/provider_dashboard');
      
    }
 
  }

  // Appointments Response
  static async appointmentResponse(req, res) {
    try {
      const { appointmentId, action } = req.body;
      console.log("Appointment ID:", appointmentId);
      console.log("Action:", action)
      const status = action === 'accept' ? 'accepted' : 'cancelled';
      console.log("New status:", status);

      const result = await Provider.appointmentUpdate([status, appointmentId])
      console.log("SQL Result:", result);
      req.flash('success', `Appointment ${status}`);
      res.redirect('/providers/provider_dashboard');

    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to update appointment');
      return res.redirect('/providers/provider_dashboard');
      
    }
 
  }

  // Profile
  static async profile(req, res) {
    try {
      res.render('providersProfile', { user: req.user });
    } catch (error) {
      console.log(error)
    }
  }

  // Chat
  static async chat(req, res) {
    try {
      res.render('chat')
    } catch (error) {
      console.log(error)
    }
  }

  // Lists of all status of patients per provider
  static async patientsList(req, res) {
    try {
      const providerId = req.session.user.id
      
      const appointments = await Provider.allStatusAppointment(providerId)
      
      res.render('pUsersAppointment', { 
        specialty: '', 
        patients: '', 
        appointments,
        type: 'appointmentss', 
        status: '', 
        user: req.session.user, 
        messages: req.flash() 
      });

    } catch (error) {
      console.log(error);
      req.flash('error', 'Failed to fetch appointments');
      return res.redirect('/providers/provider_dashboard');
    }

  }

  // Logout
  static async logout(req, res) {
    try {
      const providerId = req.session.user.id
      
      await Provider.availabilityOffline(providerId)
      
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

}


module.exports = providerController