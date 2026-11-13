
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const API_URL = "http://localhost:5000";

function HotelDetailPage() {
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getHotel = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          API_URL + "/api/hotels/" + id,
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load hotel");
        }

        setHotel(result);

      } catch (error) {
        setError(error.message || "Unable to load hotel");
      } finally {
        setLoading(false);
      }
    };

    getHotel();
  }, [id]);

  if (loading) {
    return <p className="detail-container">Loading hotel...</p>;
  }

  if (error || !hotel) {
    return (
      <div className="detail-container">
        <h2>{error || "Hotel not found"}</h2>
        <Link to="/hotels">*-----.....Back to Hotels......-----*</Link>
      </div>
    );
  }

  const mapUrl =
    "https://www.openstreetmap.org/export/embed.html?bbox=" +
    (hotel.longitude - 0.01) + "%2C" +
    (hotel.latitude - 0.01) + "%2C" +
    (hotel.longitude + 0.01) + "%2C" +
    (hotel.latitude + 0.01) +
    "&layer=mapnik&marker=" +
    hotel.latitude + "%2C" + hotel.longitude;

  return (
    <div className="detail-container">

      <Helmet>
        <title>{hotel.title} | Hotel Management</title>
        <meta name="description" content={hotel.description} />
      </Helmet>

      <Link to="/hotels" className="back-link">
       *------Back to Hotels------*
      </Link>

      <div className="detail-card">

        <img
          src={API_URL + hotel.image}
          alt={hotel.title}
          className="detail-image"
        />

        <div className="detail-content">

          <h1>{hotel.title}</h1>

          <p className="detail-price">
            ₹{Number(hotel.price).toLocaleString("en-IN")} / day
          </p>

          <h3>Description</h3>
          <p>{hotel.description}</p>

          <h3>Location Details</h3>
          <p>Latitude: {hotel.latitude}</p>
          <p>Longitude: {hotel.longitude}</p>

          <h3>Hotel Location Map</h3>

          <iframe
            title="Hotel Location Map"
            src={mapUrl}
            className="hotel-map"
            loading="lazy"
          />

        </div>
      </div>
    </div>
  );
}

export default HotelDetailPage;