import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "#f8f9fa",
            textAlign: "center"
        }}>
            <h1 style={{ fontSize: "6rem", fontWeight: "bold", color: "#343a40" }}>404</h1>
            <h2 style={{ fontSize: "2rem", color: "#6c757d" }}>Page Not Found</h2>
            <p style={{ fontSize: "1.2rem", color: "#6c757d", marginBottom: "20px" }}>
                The page you are looking for does not exist or has been moved.
            </p>
            <Link to="/" style={{
                textDecoration: "none",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                borderRadius: "5px",
                fontSize: "1rem"
            }}>
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;
