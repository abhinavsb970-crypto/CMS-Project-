const prescriptions = [
  {
    prescriptionId: 1,
    patientName: "Rahul Kumar",
    patientId: "P001",
    appointmentId: "APT001",
    appointmentDate: "2026-09-01",
    doctor: "Dr. Anil Kumar",

    medicines: [
      {
        medicineName: "Paracetamol",
        dosage: "500 mg",
        duration: "5 Days",
        prescribedQuantity: 10,
      },
      {
        medicineName: "Cetirizine",
        dosage: "10 mg",
        duration: "3 Days",
        prescribedQuantity: 3,
      },
    ],
  },

  {
    prescriptionId: 2,
    patientName: "Priya Sharma",
    patientId: "P002",
    appointmentId: "APT002",
    appointmentDate: "2026-09-01",
    doctor: "Dr. Meera Nair",

    medicines: [
      {
        medicineName: "Amoxicillin",
        dosage: "500 mg",
        duration: "7 Days",
        prescribedQuantity: 14,
      },
    ],
  },

  {
    prescriptionId: 3,
    patientName: "Arjun Das",
    patientId: "P003",
    appointmentId: "APT003",
    appointmentDate: "2026-08-31",
    doctor: "Dr. Anil Kumar",

    medicines: [
      {
        medicineName: "Vitamin C",
        dosage: "500 mg",
        duration: "10 Days",
        prescribedQuantity: 10,
      },
    ],
  },
];

export default prescriptions;