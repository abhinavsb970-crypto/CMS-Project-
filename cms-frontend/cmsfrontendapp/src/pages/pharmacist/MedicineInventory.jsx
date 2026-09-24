import { useEffect, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function MedicineInventory() {
  // ==========================================
  // STATE
  // ==========================================

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // ADD MEDICINE
  // ==========================================

  const [showAddForm, setShowAddForm] = useState(false);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    medicine_type: "",
    batch_no: "",
    manufacture_date: "",
    expiry_date: "",
    stock: "",
    price: "",
    status: "Active",
  });

  // ==========================================
  // UPDATE MEDICINE
  // ==========================================

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [stockChange, setStockChange] = useState("");
  const [transactionType, setTransactionType] = useState("Stock In");
  const [editPrice, setEditPrice] = useState("");

  // ==========================================
  // LOAD MEDICINES
  // ==========================================

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await pharmacyapi.get(
        "pharmacist/medicines/"
      );

      setMedicines(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading medicines:",
        error
      );

      setError(
        "Unable to load medicines. Make sure the Django server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchMedicines = async () => {
      try {
        const response = await pharmacyapi.get(
          "pharmacist/medicines/"
        );

        if (!cancelled) {
          setMedicines(
            Array.isArray(response.data)
              ? response.data
              : []
          );

          setError("");
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Error loading medicines:",
          error
        );

        if (!cancelled) {
          setError(
            "Unable to load medicines. Make sure the Django server is running."
          );

          setLoading(false);
        }
      }
    };

    fetchMedicines();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // HANDLE ADD MEDICINE INPUT
  // ==========================================

  const handleMedicineChange = (event) => {
    const { name, value } = event.target;

    setNewMedicine((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD MEDICINE
  // ==========================================

  const handleAddMedicine = async (event) => {
    event.preventDefault();

    try {
      await pharmacyapi.post(
        "pharmacist/medicines/",
        {
          ...newMedicine,
          stock: Number(newMedicine.stock),
          price: Number(newMedicine.price),
        }
      );

      alert("Medicine added successfully!");

      // Reset form
      setNewMedicine({
        name: "",
        medicine_type: "",
        batch_no: "",
        manufacture_date: "",
        expiry_date: "",
        stock: "",
        price: "",
        status: "Active",
      });

      // Close form
      setShowAddForm(false);

      // Reload medicines
      await loadMedicines();
    } catch (error) {
      console.error(
        "Add medicine error:",
        error.response?.data || error
      );

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to add medicine."
      );
    }
  };

  // ==========================================
  // OPEN UPDATE FORM
  // ==========================================

  const handleOpenStockUpdate = (medicine) => {
    setSelectedMedicine(medicine);

    setStockChange("");
    setTransactionType("Stock In");

    // Load current price
    setEditPrice(medicine.price ?? "");

    // Close Add Medicine form
    setShowAddForm(false);
  };

  // ==========================================
  // UPDATE STOCK AND PRICE
  // ==========================================

  const handleUpdateMedicine = async () => {
    if (!selectedMedicine) {
      return;
    }

    const previousStock =
      Number(selectedMedicine.stock) || 0;

    const quantity =
      Number(stockChange) || 0;

    let newStock = previousStock;

    // ======================================
    // UPDATE STOCK IF QUANTITY ENTERED
    // ======================================

    if (stockChange !== "") {
      if (quantity <= 0) {
        alert(
          "Please enter a valid stock quantity."
        );
        return;
      }

      if (transactionType === "Stock In") {
        newStock =
          previousStock + quantity;
      } else {
        newStock =
          previousStock - quantity;
      }

      // Prevent negative stock
      if (newStock < 0) {
        alert(
          `Cannot remove ${quantity} medicines. Current stock is only ${previousStock}.`
        );
        return;
      }
    }

    // ======================================
    // VALIDATE PRICE
    // ======================================

    const newPrice = Number(editPrice);

    if (
      editPrice === "" ||
      newPrice < 0 ||
      Number.isNaN(newPrice)
    ) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      // ====================================
      // UPDATE STOCK + PRICE
      // ====================================

      await pharmacyapi.patch(
        `pharmacist/medicines/${selectedMedicine.id}/`,
        {
          stock: newStock,
          price: newPrice,
        }
      );

      alert("Medicine updated successfully!");

      // Close form
      setSelectedMedicine(null);
      setStockChange("");
      setEditPrice("");

      // Reload inventory
      await loadMedicines();
    } catch (error) {
      console.error(
        "Medicine update error:",
        error.response?.data || error
      );

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to update medicine."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="inventory">
        <h1>Medicine Inventory</h1>
        <p>Loading medicines...</p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="inventory">
        <h1>Medicine Inventory</h1>

        <p style={{ color: "red" }}>
          {error}
        </p>

        <button onClick={loadMedicines}>
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="inventory">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="inventory-header">

        <div>
          <h1>Medicine Inventory</h1>

          <p>
            Manage and monitor medicine stock.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >

          <button
            className="add-medicine-button"
            onClick={() => {
              setShowAddForm(true);
              setSelectedMedicine(null);
            }}
          >
            + Add Medicine
          </button>

          <button onClick={loadMedicines}>
            Refresh
          </button>

        </div>

      </div>

      {/* ================================= */}
      {/* ADD MEDICINE FORM */}
      {/* ================================= */}

      {showAddForm && (
        <div className="add-medicine-form-container">

          <h2>Add New Medicine</h2>

          <form
            className="add-medicine-form"
            onSubmit={handleAddMedicine}
          >

            <div className="form-group">
              <label>
                Medicine Name
              </label>

              <input
                type="text"
                name="name"
                value={newMedicine.name}
                onChange={handleMedicineChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Medicine Type
              </label>

              <input
                type="text"
                name="medicine_type"
                placeholder="Tablet, Syrup, Capsule..."
                value={newMedicine.medicine_type}
                onChange={handleMedicineChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Batch Number
              </label>

              <input
                type="text"
                name="batch_no"
                value={newMedicine.batch_no}
                onChange={handleMedicineChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Manufacture Date
              </label>

              <input
                type="date"
                name="manufacture_date"
                value={newMedicine.manufacture_date}
                onChange={handleMedicineChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Expiry Date
              </label>

              <input
                type="date"
                name="expiry_date"
                value={newMedicine.expiry_date}
                onChange={handleMedicineChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Initial Stock
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                value={newMedicine.stock}
                onChange={handleMedicineChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Price Per Unit
              </label>

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={newMedicine.price}
                onChange={handleMedicineChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Status
              </label>

              <select
                name="status"
                value={newMedicine.status}
                onChange={handleMedicineChange}
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

                <option value="Expired">
                  Expired
                </option>
              </select>
            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="save-medicine-button"
              >
                Save Medicine
              </button>

              <button
                type="button"
                className="cancel-medicine-button"
                onClick={() => {
                  setShowAddForm(false);
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ================================= */}
      {/* UPDATE STOCK AND PRICE FORM */}
      {/* ================================= */}

      {selectedMedicine && (
        <div className="add-medicine-form-container">

          <h2>Update Medicine</h2>

          <p>
            <strong>Medicine:</strong>{" "}
            {selectedMedicine.name}
          </p>

          <p>
            <strong>Current Stock:</strong>{" "}
            {selectedMedicine.stock}
          </p>

          <p>
            <strong>Current Price:</strong>{" "}
            ₹{selectedMedicine.price}
          </p>

          <div className="add-medicine-form">

            {/* TRANSACTION TYPE */}

            <div className="form-group">

              <label>
                Transaction Type
              </label>

              <select
                value={transactionType}
                onChange={(event) =>
                  setTransactionType(
                    event.target.value
                  )
                }
              >
                <option value="Stock In">
                  Stock In
                </option>

                <option value="Stock Out">
                  Stock Out
                </option>
              </select>

            </div>

            {/* STOCK QUANTITY */}

            <div className="form-group">

              <label>
                Stock Quantity
              </label>

              <input
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={stockChange}
                onChange={(event) =>
                  setStockChange(
                    event.target.value
                  )
                }
              />

            </div>

            {/* PRICE EDIT */}

            <div className="form-group">

              <label>
                Price Per Unit
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter new price"
                value={editPrice}
                onChange={(event) =>
                  setEditPrice(
                    event.target.value
                  )
                }
              />

            </div>

            {/* ACTIONS */}

            <div className="form-actions">

              <button
                className="save-medicine-button"
                onClick={handleUpdateMedicine}
              >
                Update Medicine
              </button>

              <button
                className="cancel-medicine-button"
                onClick={() => {
                  setSelectedMedicine(null);
                  setStockChange("");
                  setEditPrice("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* MEDICINE TABLE */}
      {/* ================================= */}

      <div className="table-container">

        <table>

          <thead>
            <tr>

              <th>ID</th>

              <th>
                Medicine Name
              </th>

              <th>
                Type
              </th>

              <th>
                Batch No.
              </th>

              <th>
                Manufacture Date
              </th>

              <th>
                Expiry Date
              </th>

              <th>
                Stock
              </th>

              <th>
                Price
              </th>

              <th>
                Status
              </th>

              <th>
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {medicines.length === 0 ? (

              <tr>

                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No medicines available.
                </td>

              </tr>

            ) : (

              medicines.map((medicine) => (

                <tr key={medicine.id}>

                  <td>
                    {medicine.id}
                  </td>

                  <td>
                    {medicine.name}
                  </td>

                  <td>
                    {medicine.medicine_type}
                  </td>

                  <td>
                    {medicine.batch_no}
                  </td>

                  <td>
                    {medicine.manufacture_date}
                  </td>

                  <td>
                    {medicine.expiry_date}
                  </td>

                  <td>
                    {medicine.stock}
                  </td>

                  <td>
                    ₹
                    {Number(
                      medicine.price
                    ).toFixed(2)}
                  </td>

                  <td>
                    {medicine.status}
                  </td>

                  <td>

                    <button
                      className="edit-medicine-button"
                      onClick={() =>
                        handleOpenStockUpdate(
                          medicine
                        )
                      }
                    >
                      Update
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default MedicineInventory;