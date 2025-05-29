import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
    return (
        <footer className="bg-white text-muted py-4">
            <div className="container text-center">
                <p>© {new Date().getFullYear()} Yudai Nakamura. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
