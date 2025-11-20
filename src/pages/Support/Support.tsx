const SupportPage = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: "1.6",
        color: "#333",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "10px",
            color: "#1a1a1a",
          }}
        >
          Tezsell Support
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#666",
          }}
        >
          테즈셀 고객지원
        </p>
      </header>

      {/* Welcome Section */}
      <section style={{ marginBottom: "40px" }}>
        <p style={{ fontSize: "1.1rem", textAlign: "center", color: "#555" }}>
          We're here to help! If you have any questions or need assistance with
          Tezsell, please reach out to us using the contact information below.
        </p>
      </section>

      {/* Contact Information */}
      <section
        style={{
          background: "#f8f9fa",
          padding: "30px",
          borderRadius: "12px",
          marginBottom: "40px",
          border: "1px solid #e9ecef",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            marginBottom: "25px",
            color: "#1a1a1a",
          }}
        >
          Contact Us
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              color: "#495057",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            📧 Email Support
          </h3>
          <a
            href="bananatalkmain@gmail.com"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: "1.1rem",
            }}
          >
            bananatalkmain@gmail.com
          </a>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              color: "#495057",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            📱 Phone Support
          </h3>
          <a
            href="tel:+821082773725"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: "1.1rem",
            }}
          >
            +82-10-8277-3725
          </a>
        </div>

        <div>
          <h3
            style={{
              fontSize: "1.1rem",
              color: "#495057",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            ⏰ Support Hours
          </h3>
          <p style={{ margin: 0, fontSize: "1rem", color: "#6c757d" }}>
            Monday - Friday: 9:00 AM - 6:00 PM KST
            <br />
            Saturday: 10:00 AM - 4:00 PM KST
            <br />
            Sunday: Closed
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ marginBottom: "40px" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            marginBottom: "25px",
            color: "#1a1a1a",
          }}
        >
          Frequently Asked Questions
        </h2>

        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              color: "#495057",
              marginBottom: "10px",
            }}
          >
            How do I create a listing?
          </h3>
          <p style={{ color: "#6c757d", marginLeft: "20px" }}>
            Tap the "Sell" button on the home screen, add photos of your item,
            fill in the details, set your price, and publish your listing.
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              color: "#495057",
              marginBottom: "10px",
            }}
          >
            How do I contact a seller?
          </h3>
          <p style={{ color: "#6c757d", marginLeft: "20px" }}>
            Click on any listing to view details, then tap the "Chat" button to
            start a conversation with the seller.
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              color: "#495057",
              marginBottom: "10px",
            }}
          >
            Is Tezsell free to use?
          </h3>
          <p style={{ color: "#6c757d", marginLeft: "20px" }}>
            Yes! Tezsell is completely free. There are no listing fees or
            transaction fees.
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              color: "#495057",
              marginBottom: "10px",
            }}
          >
            How do I stay safe while trading?
          </h3>
          <p style={{ color: "#6c757d", marginLeft: "20px" }}>
            Always meet in public places, inspect items before purchasing, and
            trust your instincts. Report any suspicious activity to our team.
          </p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              color: "#495057",
              marginBottom: "10px",
            }}
          >
            How do I report an issue?
          </h3>
          <p style={{ color: "#6c757d", marginLeft: "20px" }}>
            Email us at support@tezsell.com with details about the issue, and
            we'll investigate and respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Additional Resources */}
      <section
        style={{
          background: "#e7f3ff",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "40px",
          border: "1px solid #b3d9ff",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "15px",
            color: "#1a1a1a",
          }}
        >
          Additional Resources
        </h2>

        <ul
          style={{
            paddingLeft: "20px",
            color: "#495057",
          }}
        >
          <li style={{ marginBottom: "10px" }}>
            <a
              href="/privacy"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Privacy Policy
            </a>
          </li>
          <li style={{ marginBottom: "10px" }}>
            <a
              href="/terms"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Terms of Service
            </a>
          </li>
          <li style={{ marginBottom: "10px" }}>
            <a
              href="/community-guidelines"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Community Guidelines
            </a>
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "30px 0",
          borderTop: "1px solid #e9ecef",
          color: "#6c757d",
        }}
      >
        <p style={{ margin: "0 0 10px 0" }}>Tezsell - Your Local Marketplace</p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          © 2025 Tezsell. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SupportPage;
