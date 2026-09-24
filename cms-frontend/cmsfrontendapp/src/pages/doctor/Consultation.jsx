import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getPatientFile,
    getMedicines,
    getLabTests,
    saveConsultation
} from "../../api/doctorApi";


const FREQUENCIES = [
    "1-1-1",
    "1-0-1",
    "1-0-0",
    "0-1-0",
    "0-0-1",
    "SOS"
];


const DURATIONS = [
    3,
    5,
    7,
    10,
    15
];


const INSTRUCTIONS = [
    "Before Food",
    "After Food",
    "With Food",
    "Empty Stomach"
];


const ROUTES = [
    "Oral",
    "Injection",
    "Syrup",
    "Drops",
    "Ointment",
    "Inhalation"
];


function Consultation() {

    const navigate = useNavigate();

    const {
        appointmentId
    } = useParams();


    const [patient, setPatient] =
        useState(null);

    const [medicines, setMedicines] =
        useState([]);

    const [labTests, setLabTests] =
        useState([]);


    const [
        selectedMedicines,
        setSelectedMedicines
    ] = useState([]);

    const [
        selectedLabTests,
        setSelectedLabTests
    ] = useState([]);


    const [symptoms, setSymptoms] =
        useState("");

    const [diagnosis, setDiagnosis] =
        useState("");

    const [doctorNotes, setDoctorNotes] =
        useState("");


    const [
        selectedMedicineId,
        setSelectedMedicineId
    ] = useState("");

    const [
        frequency,
        setFrequency
    ] = useState("");

    const [
        duration,
        setDuration
    ] = useState("");

    const [
        instructions,
        setInstructions
    ] = useState("");

    const [
        route,
        setRoute
    ] = useState("");

    const [
        quantity,
        setQuantity
    ] = useState("");


    const [
        selectedLabId,
        setSelectedLabId
    ] = useState("");


    const [
        editingMedicineIndex,
        setEditingMedicineIndex
    ] = useState(null);

    const [
        editingLabIndex,
        setEditingLabIndex
    ] = useState(null);


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [saved, setSaved] =
        useState(false);


    /*
     * LOAD PATIENT, MEDICINES AND LAB TESTS
     *
     * The async function is inside useEffect.
     * This avoids the React cascading-render warning.
     */
    useEffect(() => {

        async function loadData() {

            try {

                setLoading(true);
                setError("");

                const [
                    patientData,
                    medicineData,
                    labData
                ] = await Promise.all([
                    getPatientFile(
                        appointmentId
                    ),
                    getMedicines(),
                    getLabTests()
                ]);


                setPatient(
                    patientData
                );


                setMedicines(
                    Array.isArray(medicineData)
                        ? medicineData
                        : medicineData?.results || []
                );


                setLabTests(
                    Array.isArray(labData)
                        ? labData
                        : labData?.results || []
                );

            } catch (err) {

                setError(
                    err.message ||
                    "Failed to load consultation data."
                );

            } finally {

                setLoading(false);

            }
        }


        if (appointmentId) {
            loadData();
        }

    }, [appointmentId]);


    /*
     * RESET MEDICINE FORM
     */
    function resetMedicineForm() {

        setSelectedMedicineId("");
        setFrequency("");
        setDuration("");
        setInstructions("");
        setRoute("");
        setQuantity("");
        setEditingMedicineIndex(null);

    }


    /*
     * ADD OR UPDATE MEDICINE
     */
    function addMedicine() {

        if (
            !selectedMedicineId ||
            !frequency ||
            !duration ||
            !instructions ||
            !route ||
            !quantity
        ) {

            setError(
                "Please fill all medicine fields."
            );

            return;
        }


        if (
            Number(quantity) <= 0
        ) {

            setError(
                "Quantity must be greater than zero."
            );

            return;
        }


        const medicine =
            medicines.find(
                (item) =>
                    item.id ===
                    Number(selectedMedicineId)
            );


        if (!medicine) {

            setError(
                "Medicine not found."
            );

            return;
        }


        const alreadySelected =
            selectedMedicines.some(
                (item, index) =>
                    item.medicine_id ===
                        medicine.id &&
                    index !==
                        editingMedicineIndex
            );


        if (alreadySelected) {

            setError(
                "This medicine has already been selected."
            );

            return;
        }


        const medicineData = {

            medicine_id:
                medicine.id,

            medicine_name:
                medicine.name,

            strength:
                medicine.strength,

            frequency:

                frequency,

            duration:
                Number(duration),

            instructions:

                instructions,

            route:
                route,

            quantity:
                Number(quantity)

        };


        if (
            editingMedicineIndex !== null
        ) {

            const updated =
                [
                    ...selectedMedicines
                ];

            updated[
                editingMedicineIndex
            ] = medicineData;

            setSelectedMedicines(
                updated
            );

        } else {

            setSelectedMedicines(
                [
                    ...selectedMedicines,
                    medicineData
                ]
            );

        }


        setError("");

        resetMedicineForm();

    }


    /*
     * EDIT MEDICINE
     */
    function editMedicine(index) {

        const medicine =
            selectedMedicines[index];


        setSelectedMedicineId(
            medicine.medicine_id
        );

        setFrequency(
            medicine.frequency
        );

        setDuration(
            medicine.duration
        );

        setInstructions(
            medicine.instructions
        );

        setRoute(
            medicine.route
        );

        setQuantity(
            medicine.quantity
        );

        setEditingMedicineIndex(
            index
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /*
     * DELETE MEDICINE
     */
    function deleteMedicine(index) {

        const updated =
            selectedMedicines.filter(
                (_, i) =>
                    i !== index
            );


        setSelectedMedicines(
            updated
        );

    }


    /*
     * ADD OR UPDATE LAB TEST
     */
    function addLabTest() {

        if (!selectedLabId) {

            setError(
                "Please select a lab test."
            );

            return;
        }


        const lab =
            labTests.find(
                (item) =>
                    item.id ===
                    Number(selectedLabId)
            );


        if (!lab) {

            setError(
                "Lab test not found."
            );

            return;
        }


        const alreadySelected =
            selectedLabTests.some(
                (item, index) =>
                    item.lab_test_id ===
                        lab.id &&
                    index !==
                        editingLabIndex
            );


        if (alreadySelected) {

            setError(
                "This lab test has already been selected."
            );

            return;
        }


        const labData = {

            lab_test_id:
                lab.id,

            test_name:
                lab.test_name,

            test_code:
                lab.test_code,

            category:
                lab.category,

            price:
                lab.price

        };


        if (
            editingLabIndex !== null
        ) {

            const updated =
                [
                    ...selectedLabTests
                ];

            updated[
                editingLabIndex
            ] = labData;

            setSelectedLabTests(
                updated
            );

        } else {

            setSelectedLabTests(
                [
                    ...selectedLabTests,
                    labData
                ]
            );

        }


        setSelectedLabId("");

        setEditingLabIndex(null);

        setError("");

    }


    /*
     * EDIT LAB TEST
     */
    function editLabTest(index) {

        const lab =
            selectedLabTests[index];


        setSelectedLabId(
            lab.lab_test_id
        );

        setEditingLabIndex(
            index
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /*
     * DELETE LAB TEST
     */
    function deleteLabTest(index) {

        const updated =
            selectedLabTests.filter(
                (_, i) =>
                    i !== index
            );


        setSelectedLabTests(
            updated
        );

    }


    /*
     * SAVE CONSULTATION
     */
    async function handleSave() {

        if (!symptoms.trim()) {

            setError(
                "Symptoms are required."
            );

            return;
        }


        if (!diagnosis.trim()) {

            setError(
                "Diagnosis is required."
            );

            return;
        }


        try {

            setSaving(true);
            setError("");


            const data = {

                symptoms:
                    symptoms,

                diagnosis:
                    diagnosis,

                doctor_notes:
                    doctorNotes,

                medicines:
                    selectedMedicines.map(
                        (medicine) => ({

                            medicine_id:
                                medicine.medicine_id,

                            frequency:
                                medicine.frequency,

                            duration:
                                medicine.duration,

                            instructions:
                                medicine.instructions,

                            route:
                                medicine.route,

                            quantity:
                                medicine.quantity

                        })
                    ),

                lab_tests:
                    selectedLabTests.map(
                        (lab) => ({

                            lab_test_id:
                                lab.lab_test_id

                        })
                    )

            };


            await saveConsultation(
                appointmentId,
                data
            );


            setSaved(true);

        } catch (err) {

            setError(
                err.message ||
                "Failed to save consultation."
            );

        } finally {

            setSaving(false);

        }

    }


    /*
     * LOADING SCREEN
     */
    if (loading) {

        return (

            <div className="min-vh-100 bg-light">

                <div className="container py-5 text-center">

                    <div
                        className="spinner-border text-primary"
                    />

                    <div className="mt-2">
                        Loading consultation...
                    </div>

                </div>

            </div>

        );

    }


    /*
     * SAVED SCREEN
     */
    if (saved) {

        return (

            <div className="min-vh-100 bg-light">

                <div className="container py-5">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body text-center p-5">

                            <i
                                className="bi bi-check-circle-fill text-success"
                                style={{
                                    fontSize: "60px"
                                }}
                            ></i>


                            <h3 className="mt-3 fw-bold">

                                Consultation Saved Successfully

                            </h3>


                            <p className="text-muted">

                                The appointment has been completed.

                            </p>


                            <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">

                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate(
                                            "/doctor/consultation"
                                        )
                                    }
                                >

                                    <i className="bi bi-arrow-right me-2"></i>

                                    Continue With Next Patient

                                </button>


                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() =>
                                        window.print()
                                    }
                                >

                                    <i className="bi bi-printer me-2"></i>

                                    Print Prescription

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    /*
     * MAIN CONSULTATION PAGE
     */
    return (

        <div className="min-vh-100 bg-light">

            <div className="container py-4">


                {/* BACK BUTTON */}

                <button
                    className="btn btn-link text-dark text-decoration-none px-0 mb-3"
                    onClick={() =>
                        navigate(-1)
                    }
                >

                    <i className="bi bi-arrow-left fs-5 me-2"></i>

                    Back

                </button>


                {/* ERROR */}

                {error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )}


                {/* PATIENT INFORMATION */}

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-primary text-white">

                        <h4 className="mb-0">

                            Consultation

                        </h4>

                    </div>


                    <div className="card-body">

                        <div className="row g-3">


                            <div className="col-md-3">

                                <div className="text-muted small">
                                    Patient ID
                                </div>

                                <strong>
                                    {patient?.patient_id}
                                </strong>

                            </div>


                            <div className="col-md-3">

                                <div className="text-muted small">
                                    Patient Name
                                </div>

                                <strong>
                                    {patient?.patient_name}
                                </strong>

                            </div>


                            <div className="col-md-3">

                                <div className="text-muted small">
                                    Age
                                </div>

                                <strong>
                                    {patient?.age}
                                </strong>

                            </div>


                            <div className="col-md-3">

                                <div className="text-muted small">
                                    Appointment
                                </div>

                                <strong>
                                    #{patient?.appointment_id}
                                </strong>

                            </div>


                        </div>

                    </div>

                </div>


                {/* CONSULTATION DETAILS */}

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-white">

                        <h5 className="fw-bold mb-0">

                            Consultation Details

                        </h5>

                    </div>


                    <div className="card-body">


                        {/* SYMPTOMS */}

                        <div className="mb-3">

                            <label className="form-label fw-semibold">

                                Symptoms

                            </label>

                            <textarea
                                className="form-control"
                                rows="4"
                                value={symptoms}
                                onChange={(e) =>
                                    setSymptoms(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        {/* DIAGNOSIS */}

                        <div className="mb-3">

                            <label className="form-label fw-semibold">

                                Diagnosis

                            </label>

                            <textarea
                                className="form-control"
                                rows="3"
                                value={diagnosis}
                                onChange={(e) =>
                                    setDiagnosis(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        {/* DOCTOR NOTES */}

                        <div>

                            <label className="form-label fw-semibold">

                                Doctor Notes

                            </label>

                            <textarea
                                className="form-control"
                                rows="3"
                                value={doctorNotes}
                                onChange={(e) =>
                                    setDoctorNotes(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                    </div>

                </div>


                {/* MEDICINES */}

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-white">

                        <h5 className="fw-bold mb-0">

                            <i className="bi bi-capsule me-2"></i>

                            Medicines

                        </h5>

                    </div>


                    <div className="card-body">


                        <div className="row g-3">


                            {/* MEDICINE */}

                            <div className="col-md-6">

                                <label className="form-label">

                                    Medicine

                                </label>

                                <select
                                    className="form-select"
                                    value={selectedMedicineId}
                                    onChange={(e) =>
                                        setSelectedMedicineId(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">

                                        Select Medicine

                                    </option>


                                    {medicines.map(
                                        (medicine) => {

                                            const selected =
                                                selectedMedicines.some(
                                                    (item) =>
                                                        item.medicine_id ===
                                                        medicine.id
                                                );


                                            return (

                                                <option
                                                    key={medicine.id}
                                                    value={medicine.id}
                                                    disabled={
                                                        selected &&
                                                        editingMedicineIndex ===
                                                        null
                                                    }
                                                >

                                                    {medicine.name}

                                                    {medicine.strength
                                                        ? ` - ${medicine.strength}`
                                                        : ""}

                                                    {selected
                                                        ? " (Selected)"
                                                        : ""}

                                                </option>

                                            );

                                        }
                                    )}

                                </select>

                            </div>


                            {/* FREQUENCY */}

                            <div className="col-md-3">

                                <label className="form-label">

                                    Frequency

                                </label>

                                <select
                                    className="form-select"
                                    value={frequency}
                                    onChange={(e) =>
                                        setFrequency(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>


                                    {FREQUENCIES.map(
                                        (item) => (

                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* DURATION */}

                            <div className="col-md-3">

                                <label className="form-label">

                                    Duration

                                </label>

                                <select
                                    className="form-select"
                                    value={duration}
                                    onChange={(e) =>
                                        setDuration(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>


                                    {DURATIONS.map(
                                        (item) => (

                                            <option
                                                key={item}
                                                value={item}
                                            >

                                                {item} days

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* INSTRUCTIONS */}

                            <div className="col-md-3">

                                <label className="form-label">

                                    Instructions

                                </label>

                                <select
                                    className="form-select"
                                    value={instructions}
                                    onChange={(e) =>
                                        setInstructions(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>


                                    {INSTRUCTIONS.map(
                                        (item) => (

                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* ROUTE */}

                            <div className="col-md-3">

                                <label className="form-label">

                                    Route

                                </label>

                                <select
                                    className="form-select"
                                    value={route}
                                    onChange={(e) =>
                                        setRoute(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>


                                    {ROUTES.map(
                                        (item) => (

                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* QUANTITY */}

                            <div className="col-md-3">

                                <label className="form-label">

                                    Quantity

                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* ADD / UPDATE MEDICINE */}

                            <div className="col-md-3 d-flex align-items-end">

                                <button
                                    className="btn btn-primary w-100"
                                    onClick={
                                        addMedicine
                                    }
                                >

                                    {editingMedicineIndex !==
                                    null
                                        ? "Update Medicine"
                                        : "Add Medicine"}

                                </button>

                            </div>


                        </div>


                        {/* SELECTED MEDICINES TABLE */}

                        {selectedMedicines.length > 0 && (

                            <div className="table-responsive mt-4">

                                <table className="table table-bordered align-middle">

                                    <thead className="table-light">

                                        <tr>

                                            <th>
                                                Medicine
                                            </th>

                                            <th>
                                                Frequency
                                            </th>

                                            <th>
                                                Duration
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                            <th>
                                                Route
                                            </th>

                                            <th>
                                                Instructions
                                            </th>

                                            <th>
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {selectedMedicines.map(
                                            (
                                                medicine,
                                                index
                                            ) => (

                                                <tr
                                                    key={index}
                                                >

                                                    <td>

                                                        {
                                                            medicine.medicine_name
                                                        }

                                                        {medicine.strength &&
                                                            ` - ${medicine.strength}`}

                                                    </td>


                                                    <td>

                                                        {
                                                            medicine.frequency
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            medicine.duration
                                                        }

                                                        {" days"}

                                                    </td>


                                                    <td>

                                                        {
                                                            medicine.quantity
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            medicine.route
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            medicine.instructions
                                                        }

                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() =>
                                                                editMedicine(
                                                                    index
                                                                )
                                                            }
                                                        >

                                                            <i className="bi bi-pencil"></i>

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                deleteMedicine(
                                                                    index
                                                                )
                                                            }
                                                        >

                                                            <i className="bi bi-trash"></i>

                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>


                {/* LAB TESTS */}

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-white">

                        <h5 className="fw-bold mb-0">

                            <i className="bi bi-clipboard2-pulse me-2"></i>

                            Lab Tests

                        </h5>

                    </div>


                    <div className="card-body">


                        <div className="row g-3">


                            {/* LAB TEST */}

                            <div className="col-md-9">

                                <label className="form-label">

                                    Lab Test

                                </label>

                                <select
                                    className="form-select"
                                    value={selectedLabId}
                                    onChange={(e) =>
                                        setSelectedLabId(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">

                                        Select Lab Test

                                    </option>


                                    {labTests.map(
                                        (lab) => {

                                            const selected =
                                                selectedLabTests.some(
                                                    (item) =>
                                                        item.lab_test_id ===
                                                        lab.id
                                                );


                                            return (

                                                <option
                                                    key={lab.id}
                                                    value={lab.id}
                                                    disabled={
                                                        selected &&
                                                        editingLabIndex ===
                                                        null
                                                    }
                                                >

                                                    {lab.test_name}

                                                    {" - "}

                                                    ₹{lab.price}

                                                    {selected
                                                        ? " (Selected)"
                                                        : ""}

                                                </option>

                                            );

                                        }
                                    )}

                                </select>

                            </div>


                            {/* ADD / UPDATE LAB TEST */}

                            <div className="col-md-3 d-flex align-items-end">

                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={
                                        addLabTest
                                    }
                                >

                                    {editingLabIndex !==
                                    null
                                        ? "Update Test"
                                        : "Add Lab Test"}

                                </button>

                            </div>


                        </div>


                        {/* SELECTED LAB TESTS */}

                        {selectedLabTests.length > 0 && (

                            <div className="table-responsive mt-4">

                                <table className="table table-bordered align-middle">

                                    <thead className="table-light">

                                        <tr>

                                            <th>
                                                Test
                                            </th>

                                            <th>
                                                Department
                                            </th>

                                            <th>
                                                Code
                                            </th>

                                            <th>
                                                Price
                                            </th>

                                            <th>
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {selectedLabTests.map(
                                            (
                                                lab,
                                                index
                                            ) => (

                                                <tr
                                                    key={index}
                                                >

                                                    <td>

                                                        {
                                                            lab.test_name
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            lab.category
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            lab.test_code
                                                        }

                                                    </td>


                                                    <td>

                                                        ₹
                                                        {
                                                            lab.price
                                                        }

                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() =>
                                                                editLabTest(
                                                                    index
                                                                )
                                                            }
                                                        >

                                                            <i className="bi bi-pencil"></i>

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                deleteLabTest(
                                                                    index
                                                                )
                                                            }
                                                        >

                                                            <i className="bi bi-trash"></i>

                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>


                {/* SAVE CONSULTATION */}

                <div className="card border-0 shadow-sm mb-5">

                    <div className="card-body">


                        <div className="alert alert-info">

                            Medicine and lab test selection is optional.

                            After save consultation becomes read only.

                        </div>


                        <button
                            type="button"
                            className="btn btn-success btn-lg"
                            disabled={saving}
                            onClick={
                                handleSave
                            }
                        >

                            {saving
                                ? "Saving Consultation..."
                                : "Save Consultation"}

                        </button>


                    </div>

                </div>


            </div>

        </div>

    );

}


export default Consultation;