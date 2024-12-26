//HEALTH JAVASCRIPT


// doctor nav dropdown
function Provider() {
    document.getElementById("doctorPortal").style.display = "block";
    document.getElementById("patientPortal").style.display = "none";
    document.getElementById("wrp_1").style.display = "none";
}

//patient nav dropdown
function Patient() {
    document.getElementById("patientPortal").style.display = "block";
    document.getElementById("doctorPortal").style.display = "none";
    document.getElementById("wrp_1").style.display = "none";

}

function Close() {
    document.getElementById("gen-form-container").style.display = "none";
    document.getElementById("wrp_1").style.display = "block";


}


//portals toggling
function togglePortal(divType) {
    const doctorPortal = document.getElementById('doctorPortal');
    const patientPortal = document.getElementById('patientPortal');

    if (divType === 'doctorPortal') {
        doctorPortal.style.display = 'block';
        patientPortal.style.display = 'none';
    } else {
        doctorPortal.style.display = 'none';
        patientPortal.style.display = 'block';
    }
}


// doctor signup+login form toggle
function toggleDoctor(formType) {
    const DrSignupForm = document.getElementById('DrSignupForm');
    const DrLoginForm = document.getElementById('DrLoginForm');
    const formTitle = document.getElementById('form-title');

    if (formType === 'DrLoginForm') {
        DrLoginForm.style.display = 'block';
        DrSignupForm.style.display = 'none';
        formTitle.textContent = 'Provider Login';
    } else {
        DrLoginForm.style.display = 'none';
        DrSignupForm.style.display = 'block';
        formTitle.textContent = 'Provider Sign Up';
    }
}


// patients signup+login form toggle
function togglePatient(formType) {
    const PtSignupForm = document.getElementById('PtSignupForm');
    const PtLoginForm = document.getElementById('PtLoginForm');
    const fTitle = document.getElementById('fTitle');

    if (formType === 'PtLoginForm') {
        PtLoginForm.style.display = 'block';
        PtSignupForm.style.display = 'none';
        fTitle.textContent = 'Patient Login';
    } else {
        PtLoginForm.style.display = 'none';
        PtSignupForm.style.display = 'block';
        fTitle.textContent = 'Patient Sign Up';
    }
}
