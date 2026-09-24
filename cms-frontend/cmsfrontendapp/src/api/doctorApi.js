const API_BASE = "http://127.0.0.1:8000/api/doctor";


function getToken() {
    return localStorage.getItem("accessToken");
}


async function request(
    url,
    options = {}
) {

    const token = getToken();

    if (!token) {
        throw new Error("You are not logged in.");
    }

    const response = await fetch(
        `${API_BASE}${url}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                "Authorization":
                    `Bearer ${token}`,

                ...(options.headers || {})
            }
        }
    );


    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }


    if (!response.ok) {

        let message =
            data?.detail ||
            data?.message ||
            "Something went wrong.";

        throw new Error(message);
    }


    return data;
}


// ---------------------------------------------------------
// APPOINTMENTS
// ---------------------------------------------------------

export function getTodayAppointments() {
    return request(
        "/appointments/today/"
    );
}


export function getUpcomingAppointments() {
    return request(
        "/appointments/upcoming/"
    );
}


export function getStartConsultationAppointments() {
    return request(
        "/consultations/start/"
    );
}


export function startConsultation(
    appointmentId
) {

    return request(
        `/consultations/start/${appointmentId}/`,
        {
            method: "POST"
        }
    );
}


// ---------------------------------------------------------
// PATIENT
// ---------------------------------------------------------

export function getPatientFile(
    appointmentId
) {

    return request(
        `/patients/${appointmentId}/`
    );
}


export function getMedicalHistory(
    patientId
) {

    return request(
        `/patients/${patientId}/history/`
    );
}


// ---------------------------------------------------------
// MASTER DATA
// ---------------------------------------------------------

export function getMedicines() {

    return request(
        "/masters/medicines/"
    );
}


export function getLabTests() {

    return request(
        "/masters/lab-tests/"
    );
}


// ---------------------------------------------------------
// SAVE CONSULTATION
// ---------------------------------------------------------

export function saveConsultation(
    appointmentId,
    consultationData
) {

    return request(
        `/consultations/save/${appointmentId}/`,
        {
            method: "POST",

            body: JSON.stringify(
                consultationData
            )
        }
    );
}


// ---------------------------------------------------------
// HISTORY
// ---------------------------------------------------------

export function getConsultationHistory(
    searchType,
    searchValue
) {

    let query = "";

    if (
        searchType === "patient_id"
    ) {

        query =
            `?patient_id=${encodeURIComponent(
                searchValue
            )}`;

    } else if (
        searchType === "patient_name"
    ) {

        query =
            `?patient_name=${encodeURIComponent(
                searchValue
            )}`;
    }


    return request(
        `/history/${query}`
    );
}