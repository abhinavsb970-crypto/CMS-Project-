function DoctorPageHeader({ title, description }) {

    return (
        <div className="mb-4">

            <h2 className="fw-bold">
                {title}
            </h2>

            <p className="text-muted mb-0">
                {description}
            </p>

        </div>
    );
}

export default DoctorPageHeader;