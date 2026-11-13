
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000";

function HotelForm({ onSave, initialData, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setLatitude(initialData.latitude);
      setLongitude(initialData.longitude);
      setPrice(initialData.price);
      setImagePreview(API_URL + initialData.image);
    } else {
      setTitle("");
      setDescription("");
      setLatitude("");
      setLongitude("");
      setPrice("");
      setImagePreview("");
    }

    setImageFile(null);
    setErrors({});
  }, [initialData]);

  const handleImage = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors({
        ...errors,
        image: "Please select an image file"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        image: "Image size must be below 5 MB"
      });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setErrors({
      ...errors,
      image: ""
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (title.trim() === "") {
      newErrors.title = "Enter hotel name";
    }

    if (description.trim() === "") {
      newErrors.description = "Enter hotel description";
    }

    if (
      latitude === "" ||
      !Number.isFinite(Number(latitude)) ||
      Number(latitude) < -90 ||
      Number(latitude) > 90
    ) {
      newErrors.latitude = "Enter valid latitude";
    }

    if (
      longitude === "" ||
      !Number.isFinite(Number(longitude)) ||
      Number(longitude) < -180 ||
      Number(longitude) > 180
    ) {
      newErrors.longitude = "Enter valid longitude";
    }

    if (
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      newErrors.price = "Enter valid price";
    }

    if (!initialData && !imageFile) {
      newErrors.image = "Please select hotel image";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("price", price);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSave(formData);
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Hotel" : "Add Hotel"}</h2>

      <label>Hotel Image</label>

      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
      />

      {errors.image && <p className="error">{errors.image}</p>}

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Hotel Preview"
          className="image-preview"
        />
      )}

      <label>Hotel Name</label>

      <input
        type="text"
        value={title}
        placeholder="Enter hotel name"
        onChange={(event) => setTitle(event.target.value)}
      />

      {errors.title && <p className="error">{errors.title}</p>}

      <label>Description</label>

      <textarea
        value={description}
        placeholder="Enter hotel description"
        onChange={(event) => setDescription(event.target.value)}
      />

      {errors.description && (
        <p className="error">{errors.description}</p>
      )}

      <label>Latitude</label>

      <input
        type="number"
        step="any"
        value={latitude}
        placeholder="Enter latitude"
        onChange={(event) => setLatitude(event.target.value)}
      />

      {errors.latitude && <p className="error">{errors.latitude}</p>}

      <label>Longitude</label>

      <input
        type="number"
        step="any"
        value={longitude}
        placeholder="Enter longitude"
        onChange={(event) => setLongitude(event.target.value)}
      />

      {errors.longitude && <p className="error">{errors.longitude}</p>}

      <label>Price Per Day</label>

      <input
        type="number"
        min="1"
        value={price}
        placeholder="Enter price"
        onChange={(event) => setPrice(event.target.value)}
      />

      {errors.price && <p className="error">{errors.price}</p>}

      <div className="form-buttons">
        <button type="submit" className="primary-button">
          {initialData ? "Update Hotel" : "Add Hotel"}
        </button>

        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default HotelForm;