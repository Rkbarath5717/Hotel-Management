
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import HotelForm from "../Components/HotelForm";
import HotelCard from "../Components/HotelCard";

import { setHotels } from "../Store/hotelSlice";

const API_URL = "http://localhost:5000";

function HotelListPage({ role }) {
  const dispatch = useDispatch();

  const hotels = useSelector(state => state.hotels.hotels);

  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [refresh, setRefresh] = useState(0);

  const hotelsPerPage = 6;

  const invalidPrice =
    minPrice !== "" &&
    maxPrice !== "" &&
    Number(minPrice) > Number(maxPrice);

  useEffect(() => {
    const getHotels = async () => {
      if (invalidPrice) {
        dispatch(setHotels([]));
        setTotalHotels(0);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.append("limit", hotelsPerPage);
        params.append("offset", (currentPage - 1) * hotelsPerPage);

        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm.trim());
        }

        if (minPrice !== "") {
          params.append("minPrice", minPrice);
        }

        if (maxPrice !== "") {
          params.append("maxPrice", maxPrice);
        }

        const response = await fetch(
          API_URL + "/api/hotels?" + params.toString(),
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load hotel details....");
        }

        dispatch(setHotels(result.hotels));
        setTotalHotels(result.total);

      } catch (error) {
        setError(error.message);
        dispatch(setHotels([]));
        setTotalHotels(0);
      } finally {
        setLoading(false);
      }
    };

    getHotels();
  }, [
    dispatch,
    token,
    currentPage,
    searchTerm,
    minPrice,
    maxPrice,
    refresh
  ]);

  const handleSave = async (formData) => {
    setError("");
    setMessage("");

    if (role !== "admin") {
      setError("Only admin can add or update hotels");
      return;
    }

    try {
      let url = API_URL + "/api/hotels";
      let method = "POST";

      if (editingHotel) {
        url = API_URL + "/api/hotels/" + editingHotel.id;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: "Bearer " + token
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save hotel");
      }

      if (editingHotel) {
        setMessage("Hotel updated successfully");
      } else {
        setMessage("Hotel added successfully");
      }

      setShowForm(false);
      setEditingHotel(null);
      setCurrentPage(1);
      setRefresh(oldValue => oldValue + 1);

    } catch (error) {
      setError(error.message || "Unable to save hotel");
    }
  };

  const handleEdit = (hotel) => {
    if (role !== "admin") {
      return;
    }

    setEditingHotel(hotel);
    setShowForm(true);
    setMessage("");
    setError("");

    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (role !== "admin") {
      return;
    }

    const answer = window.confirm(
      "Do you want to delete this hotel?"
    );

    if (!answer) {
      return;
    }

    try {
      const response = await fetch(
        API_URL + "/api/hotels/" + id,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete hotel");
      }

      setMessage("Hotel deleted successfully");
      setRefresh(oldValue => oldValue + 1);

    } catch (error) {
      setError(error.message || "Unable to delete hotel");
    }
  };

  const totalPages = Math.ceil(totalHotels / hotelsPerPage);

  const handleAddButton = () => {
    if (role !== "admin") {
      return;
    }

    if (showForm) {
      setShowForm(false);
      setEditingHotel(null);
    } else {
      setEditingHotel(null);
      setShowForm(true);
    }

    setError("");
    setMessage("");
  };

  return (
    <div className="page-container">

      <div className="page-heading">
        <div>
          <h1>Hotel Management</h1>
          <p>Manage your hotels in one place</p>
        </div>

        {role === "admin" && (
          <button
            className="primary-button"
            onClick={handleAddButton}
          >
            {showForm ? "Close Form" : "Add Hotel"}
          </button>
        )}
      </div>

      {message && (
        <div className="success-message">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {role === "admin" && showForm ? (
        <HotelForm
          onSave={handleSave}
          initialData={editingHotel}
          onCancel={() => {
            setShowForm(false);
            setEditingHotel(null);
          }}
        />
      ) : (
        <>
          <div className="filter-section">

            <input
              type="text"
              placeholder="Search hotel by title"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />

            <input
              type="number"
              placeholder="Minimum price"
              value={minPrice}
              onChange={(event) => {
                setMinPrice(event.target.value);
                setCurrentPage(1);
              }}
            />

            <input
              type="number"
              placeholder="Maximum price"
              value={maxPrice}
              onChange={(event) => {
                setMaxPrice(event.target.value);
                setCurrentPage(1);
              }}
            />

            <button
              className="clear-button"
              onClick={() => {
                setSearchTerm("");
                setMinPrice("");
                setMaxPrice("");
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </button>

          </div>

          {invalidPrice && (
            <p className="error">
              Minimum price cannot be greater than maximum price.
            </p>
          )}

          {loading && <p>Loading hotels...</p>}

          {!loading && !invalidPrice && hotels.length > 0 && (
            <div className="hotel-list">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={{
                    ...hotel,
                    image: API_URL + hotel.image
                  }}
                  onEdit={() => handleEdit(hotel)}
                  onDelete={() => handleDelete(hotel.id)}
                  role={role}
                />
              ))}
            </div>
          )}

          {!loading && !error && !invalidPrice && hotels.length === 0 && (
            <p className="no-hotels">No hotels found.</p>
          )}

          {!loading && totalPages > 1 && (
            <div className="pagination">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={
                    currentPage === index + 1 ? "active-page" : ""
                  }
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>

            </div>
          )}
        </>
      )}

    </div>
  );
}

export default HotelListPage;