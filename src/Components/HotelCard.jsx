
import { Link } from "react-router-dom";

function HotelCard({ hotel, onEdit, onDelete, role }) {
  return (
    <div className="hotel-card">

      <img
        src={hotel.image}
        alt={hotel.title}
        className="hotel-card-image"
      />

      <div className="hotel-card-content">
        <h3>{hotel.title}</h3>

        <p className="hotel-price">
          ₹{Number(hotel.price).toLocaleString("en-IN")} / Day
        </p>

        <p>{hotel.description}</p>

        <div className="card-buttons">

          <Link
            to={"/hotels/" + hotel.id}
            className="details-button"
          >
            View Details
          </Link>

          {role === "admin" && (
            <>
              <button
                className="edit-button"
                onClick={onEdit}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={onDelete}
              >
                Delete
              </button>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

export default HotelCard;