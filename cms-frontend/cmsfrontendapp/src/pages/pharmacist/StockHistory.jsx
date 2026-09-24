import { useEffect, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function StockHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStockHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await pharmacyapi.get(
          "pharmacist/stock-history/"
        );

        console.log("STOCK HISTORY DATA:", response.data);

        setHistory(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        console.error("STOCK HISTORY ERROR:", err);

        setError(
          err.response?.data?.detail ||
          `HTTP ${err.response?.status || ""}: Failed to load stock history`
        );
      } finally {
        setLoading(false);
      }
    };

    loadStockHistory();
  }, []);

  if (loading) {
    return (
      <div className="stock-history">
        <h1>Stock History</h1>

        <div className="history-empty">
          <p>Loading stock history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-history">
        <h1>Stock History</h1>

        <div className="history-empty">
          <h3>Unable to Load Stock History</h3>

          <p style={{ color: "red" }}>
            {error}
          </p>

          <p>
            Make sure Django is running on port 8000.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-history">
      <h1>Stock History</h1>

      <p>
        View all medicine stock changes and inventory activity.
      </p>

      {history.length === 0 ? (
        <div className="history-empty">
          <h3>No Stock History Found</h3>

          <p>
            No stock transactions are available.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicine</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Change</th>
                <th>Transaction Type</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>

                  <td>
                    {item.medicine_name || "Unknown"}
                  </td>

                  <td>
                    {item.previous_stock ?? 0}
                  </td>

                  <td>
                    {item.new_stock ?? 0}
                  </td>

                  <td
                    className={
                      Number(item.change) >= 0
                        ? "stock-increase"
                        : "stock-decrease"
                    }
                  >
                    {Number(item.change) > 0 ? "+" : ""}
                    {item.change}
                  </td>

                  <td>
                    {item.transaction_type || "-"}
                  </td>

                  <td>
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleString()
                      : "-"}
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

export default StockHistory;