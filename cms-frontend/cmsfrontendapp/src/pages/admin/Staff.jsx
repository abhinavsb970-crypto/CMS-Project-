import { useEffect, useState } from "react";

// =========================
// MINIMUM AGE BY ROLE
// =========================
const MIN_AGE_BY_ROLE = {
  RECEPTIONIST: 18,
  DOCTOR: 23,
  PHARMACIST: 23,
  LAB_TECHNICIAN: 18,
};

// =========================
// CALCULATE AGE FROM DOB
// =========================
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
};

function Staff() {
  // =========================
  // STAFF DATA
  // =========================
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // STAFF SEARCH
  // =========================
  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // EDIT STAFF
  // =========================
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
    address: "",
    phone_number: "",
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  // =========================
  // ADD STAFF FORM
  // =========================
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "RECEPTIONIST",
    date_of_birth: "",
    address: "",
    phone_number: "",
    department: "",
    consultation_fee: "",
    is_active: true,
  });

  // =========================
  // LOAD DATA WHEN PAGE OPENS
  // =========================
  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  // =========================
  // FETCH STAFF
  // =========================
  const fetchStaff = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/staff/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("STAFF API ERROR:", data);
        setError("Unable to load staff.");
        setLoading(false);
        return;
      }

      setStaff(data);
    } catch (error) {
      console.error("STAFF ERROR:", error);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  // =========================
  // FETCH DEPARTMENTS
  // =========================
  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/departments/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("DEPARTMENT API ERROR:", data);
        return;
      }

      console.log("DEPARTMENTS RECEIVED BY REACT:", data);

      setDepartments(data);
    } catch (error) {
      console.error("DEPARTMENT ERROR:", error);
    }
  };

  // =========================
  // HANDLE FORM INPUT
  // =========================
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "RECEPTIONIST",
      date_of_birth: "",
      address: "",
      phone_number: "",
      department: "",
      consultation_fee: "",
      is_active: true,
    });
  };

  // =========================
  // CREATE STAFF
  // =========================
  const handleCreateStaff = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    // =========================
    // CLIENT-SIDE AGE CHECK
    // (backend re-validates this too, this is just for
    // instant feedback before hitting the server)
    // =========================
    const age = calculateAge(formData.date_of_birth);
    const minAge = MIN_AGE_BY_ROLE[formData.role] ?? 18;

    if (age === null) {
      setFormError("Date of birth is required.");
      return;
    }

    if (age < minAge) {
      setFormError(
        `A ${formData.role.replace("_", " ")} must be at least ${minAge} years old. This staff member is ${age}.`,
      );
      return;
    }

    setCreating(true);

    try {
      const dataToSend = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        phone_number: formData.phone_number,
        is_active: formData.is_active,
      };

      // =========================
      // DOCTOR-SPECIFIC DATA
      // =========================
      if (formData.role === "DOCTOR") {
        dataToSend.department = Number(formData.department);
        dataToSend.consultation_fee = formData.consultation_fee;
      }

      console.log("DATA BEING SENT:", dataToSend);

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/staff/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(dataToSend),
        },
      );

      const data = await response.json();

      // =========================
      // HANDLE ERROR
      // =========================
      if (!response.ok) {
        console.error("CREATE STAFF ERROR:", data);

        if (typeof data === "object") {
          const messages = [];

          Object.keys(data).forEach((field) => {
            const fieldErrors = data[field];

            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((message) => {
                messages.push(`${field}: ${message}`);
              });
            } else {
              messages.push(`${field}: ${fieldErrors}`);
            }
          });

          setFormError(messages.join(" "));
        } else {
          setFormError("Unable to create staff.");
        }

        setCreating(false);
        return;
      }

      // =========================
      // SUCCESS
      // =========================
      console.log("STAFF CREATED:", data);

      setSuccessMessage("Staff member created successfully.");

      resetForm();

      await fetchStaff();

      setCreating(false);
    } catch (error) {
      console.error("CREATE STAFF ERROR:", error);

      setFormError("Unable to connect to the server.");

      setCreating(false);
    }
  };

  // =========================
  // OPEN / CLOSE FORM
  // =========================
  const handleToggleForm = () => {
    setShowForm((previous) => !previous);

    setFormError("");
    setSuccessMessage("");
  };

  // =========================
  // OPEN EDIT FORM
  // =========================
  const handleEditClick = (member) => {
    setShowForm(false);

    setEditingStaffId(member.staff_id);
    setEditingRole(member.role);

    setEditFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      email: member.email || "",
      date_of_birth: member.date_of_birth || "",
      address: member.address || "",
      phone_number: member.phone_number || "",
    });

    setEditError("");
    setEditSuccess("");
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setEditError("");
    setEditSuccess("");
  };

  // =========================
  // HANDLE EDIT FORM INPUT
  // =========================
  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setEditError("");
    setEditSuccess("");
  };

  // =========================
  // SAVE EDITED STAFF
  // =========================
  const handleUpdateStaff = async (event) => {
    event.preventDefault();

    setEditError("");
    setEditSuccess("");

    // =========================
    // CLIENT-SIDE AGE CHECK
    // =========================
    const age = calculateAge(editFormData.date_of_birth);
    const minAge = MIN_AGE_BY_ROLE[editingRole] ?? 18;

    if (age === null) {
      setEditError("Date of birth is required.");
      return;
    }

    if (age < minAge) {
      setEditError(
        `A ${editingRole.replace("_", " ")} must be at least ${minAge} years old. This staff member is ${age}.`,
      );
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/staff/${editingStaffId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(editFormData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("UPDATE STAFF ERROR:", data);

        if (typeof data === "object") {
          const messages = [];

          Object.keys(data).forEach((field) => {
            const fieldErrors = data[field];

            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((message) => {
                messages.push(`${field}: ${message}`);
              });
            } else {
              messages.push(`${field}: ${fieldErrors}`);
            }
          });

          setEditError(messages.join(" "));
        } else {
          setEditError("Unable to update staff.");
        }

        setUpdating(false);
        return;
      }

      setEditSuccess("Staff member updated successfully.");

      await fetchStaff();

      setUpdating(false);

      setEditingStaffId(null);
    } catch (error) {
      console.error("UPDATE STAFF ERROR:", error);

      setEditError("Unable to connect to the server.");

      setUpdating(false);
    }
  };

  // =========================
  // ACTIVATE / DEACTIVATE STAFF
  // =========================
  const handleToggleActive = async (member) => {
    const action = member.is_active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${member.first_name} ${member.last_name}?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/staff/${member.staff_id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            is_active: !member.is_active,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("TOGGLE ACTIVE ERROR:", data);
        alert("Unable to update staff status.");
        return;
      }

      await fetchStaff();
    } catch (error) {
      console.error("TOGGLE ACTIVE ERROR:", error);
      alert("Unable to connect to the server.");
    }
  };

  // =========================
  // FILTERED STAFF LIST
  // (matches Staff ID, Name, Phone, or Email)
  // =========================
  const filteredStaff = staff.filter((member) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return true;

    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();

    return (
      member.staff_id.toLowerCase().includes(term) ||
      fullName.includes(term) ||
      (member.phone_number || "").toLowerCase().includes(term) ||
      (member.email || "").toLowerCase().includes(term)
    );
  });

  // =========================
  // LIVE AGE PREVIEW (ADD FORM)
  // computed once per render instead of calling
  // calculateAge() multiple times inline in JSX
  // =========================
  const addFormAge = calculateAge(formData.date_of_birth);
  const addFormMinAge = MIN_AGE_BY_ROLE[formData.role] ?? 18;
  const addFormIsUnderMinAge =
    addFormAge !== null && addFormAge < addFormMinAge;

  // =========================
  // LIVE AGE PREVIEW (EDIT FORM)
  // =========================
  const editFormAge = calculateAge(editFormData.date_of_birth);
  const editFormMinAge = MIN_AGE_BY_ROLE[editingRole] ?? 18;
  const editFormIsUnderMinAge =
    editFormAge !== null && editFormAge < editFormMinAge;

  return (
    <div className="staff-page">
      {/* =========================
          HEADER
          ========================= */}
      <div className="staff-header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage clinic staff members</p>
        </div>

        <button className="add-staff-button" onClick={handleToggleForm}>
          {showForm ? "Close" : "+ Add Staff"}
        </button>
      </div>

      {/* =========================
          ADD STAFF FORM
          ========================= */}
      {showForm && (
        <div className="add-staff-form">
          <h2>Add New Staff</h2>

          {/* FORM ERROR */}
          {formError && <div className="form-error">{formError}</div>}

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="form-success">{successMessage}</div>
          )}

          <form onSubmit={handleCreateStaff}>
            <div className="form-grid">
              {/* USERNAME */}
              <div className="form-field">
                <label>Username</label>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </div>

              {/* FIRST NAME */}
              <div className="form-field">
                <label>First Name</label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>

              {/* LAST NAME */}
              <div className="form-field">
                <label>Last Name</label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>

              {/* EMAIL */}
              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="form-field">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              {/* ROLE */}
              <div className="form-field">
                <label>Role</label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="RECEPTIONIST">Receptionist</option>

                  <option value="DOCTOR">Doctor</option>

                  <option value="PHARMACIST">Pharmacist</option>

                  <option value="LAB_TECHNICIAN">Lab Technician</option>
                </select>
              </div>

              {/* DATE OF BIRTH */}
              <div className="form-field">
                <label>Date of Birth</label>

                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />

                {/* Live age preview + minimum-age hint */}
                {formData.date_of_birth && addFormAge !== null && (
                  <small
                    className={
                      addFormIsUnderMinAge
                        ? "field-hint field-hint-error"
                        : "field-hint"
                    }
                  >
                    Age: {addFormAge} (minimum {addFormMinAge} required for{" "}
                    {formData.role.replace("_", " ")})
                  </small>
                )}
              </div>

              {/* PHONE NUMBER */}
              <div className="form-field">
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="e.g. +919876543210"
                  pattern="^\+?\d{7,15}$"
                  title="Enter only 10 digits, optionally starting with '+'"
                  required
                />
              </div>

              {/* ADDRESS */}
              <div className="form-field form-field-wide">
                <label>Address</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={2}
                  required
                />
              </div>

              {/* =========================
                  DEPARTMENT
                  ONLY FOR DOCTOR
                  ========================= */}
              {formData.role === "DOCTOR" && (
                <div className="form-field">
                  <label>Department</label>

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>

                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>

                  {/* Temporary debugging information */}
                  {departments.length === 0 && (
                    <small>No departments available</small>
                  )}
                </div>
              )}

              {/* =========================
                  CONSULTATION FEE
                  ONLY FOR DOCTOR
                  ========================= */}
              {formData.role === "DOCTOR" && (
                <div className="form-field">
                  <label>Consultation Fee</label>

                  <input
                    type="number"
                    name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    placeholder="Enter consultation fee"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}
            </div>

            {/* =========================
                ACTIVE STATUS
                ========================= */}
            <div className="active-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active Staff
              </label>
            </div>

            {/* =========================
                CREATE BUTTON
                ========================= */}
            <button
              type="submit"
              className="create-staff-button"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Staff"}
            </button>
          </form>
        </div>
      )}

      {/* =========================
          EDIT STAFF FORM
          ========================= */}
      {editingStaffId && (
        <div className="add-staff-form">
          <h2>Edit Staff — {editingStaffId}</h2>

          {editError && <div className="form-error">{editError}</div>}

          {editSuccess && <div className="form-success">{editSuccess}</div>}

          <form onSubmit={handleUpdateStaff}>
            <div className="form-grid">
              {/* FIRST NAME */}
              <div className="form-field">
                <label>First Name</label>

                <input
                  type="text"
                  name="first_name"
                  value={editFormData.first_name}
                  onChange={handleEditChange}
                  placeholder="Enter first name"
                />
              </div>

              {/* LAST NAME */}
              <div className="form-field">
                <label>Last Name</label>

                <input
                  type="text"
                  name="last_name"
                  value={editFormData.last_name}
                  onChange={handleEditChange}
                  placeholder="Enter last name"
                />
              </div>

              {/* EMAIL */}
              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* DATE OF BIRTH */}
              <div className="form-field">
                <label>Date of Birth</label>

                <input
                  type="date"
                  name="date_of_birth"
                  value={editFormData.date_of_birth}
                  onChange={handleEditChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />

                {editFormData.date_of_birth && editFormAge !== null && (
                  <small
                    className={
                      editFormIsUnderMinAge
                        ? "field-hint field-hint-error"
                        : "field-hint"
                    }
                  >
                    Age: {editFormAge} (minimum {editFormMinAge} required for{" "}
                    {editingRole.replace("_", " ")})
                  </small>
                )}
              </div>

              {/* PHONE NUMBER */}
              <div className="form-field">
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone_number"
                  value={editFormData.phone_number}
                  onChange={handleEditChange}
                  placeholder="e.g. +919876543210"
                  pattern="^\+?\d{7,15}$"
                  title="Enter only 10 digits, optionally starting with '+'"
                  required
                />
              </div>

              {/* ADDRESS */}
              <div className="form-field form-field-wide">
                <label>Address</label>

                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  placeholder="Enter address"
                  rows={2}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                type="submit"
                className="create-staff-button"
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="add-staff-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================
          STAFF SEARCH
          ========================= */}
      <div className="staff-search">
        <input
          type="text"
          placeholder="Search by Staff ID, Name, Phone, or Email"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* =========================
          STAFF SUMMARY
          ========================= */}
      <div className="staff-summary">
        <strong>
          {searchTerm
            ? `Showing ${filteredStaff.length} of ${staff.length} staff`
            : `Total Staff: ${staff.length}`}
        </strong>
      </div>

      {/* =========================
          LOADING
          ========================= */}
      {loading && <p>Loading staff...</p>}

      {/* =========================
          ERROR
          ========================= */}
      {error && <p className="staff-error">{error}</p>}

      {/* =========================
          STAFF TABLE
          ========================= */}
      {!loading && !error && (
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No staff found matching your search.
                  </td>
                </tr>
              )}

              {filteredStaff.map((member) => (
                <tr key={member.staff_id}>
                  <td>{member.staff_id}</td>

                  <td>{member.username}</td>

                  <td>
                    {member.first_name} {member.last_name}
                  </td>

                  <td>{member.email}</td>

                  <td>{member.phone_number || "-"}</td>

                  <td>{member.age ?? "-"}</td>

                  <td>
                    <span className="role-badge">{member.role}</span>
                  </td>

                  <td>
                    <span
                      className={
                        member.is_active
                          ? "status-badge status-active"
                          : "status-badge status-inactive"
                      }
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn edit-btn"
                        onClick={() => handleEditClick(member)}
                      >
                        Edit
                      </button>

                      <button
                        className={
                          member.is_active
                            ? "table-action-btn deactivate-btn"
                            : "table-action-btn activate-btn"
                        }
                        onClick={() => handleToggleActive(member)}
                      >
                        {member.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Staff;
