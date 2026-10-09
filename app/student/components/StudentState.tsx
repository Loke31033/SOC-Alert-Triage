
type StudentStateProps = {
  type: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  action?: React.ReactNode;
};

export default function StudentState({
  type,
  title,
  message,
  action,
}: StudentStateProps) {

  if (type === "loading") {
    return (
      <div className="student-soc-loading">
        <strong>
          {title || "Loading"}
        </strong>

        <div style={{ marginTop: 7 }}>
          {message ||
            "Retrieving contest information."}
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="student-soc-error">
        <strong>
          {title ||
            "Unable to load information"}
        </strong>

        <div style={{ marginTop: 7 }}>
          {message ||
            "Please try again."}
        </div>

        {action && (
          <div style={{ marginTop: 14 }}>
            {action}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="student-soc-empty">
      <strong>
        {title || "No information available"}
      </strong>

      <div style={{ marginTop: 7 }}>
        {message}
      </div>

      {action && (
        <div style={{ marginTop: 14 }}>
          {action}
        </div>
      )}
    </div>
  );
}
