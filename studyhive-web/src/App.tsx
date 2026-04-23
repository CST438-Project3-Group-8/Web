import { useEffect } from "react";
import { apiClient } from "./api/client";

function App() {
  useEffect(() => {
    apiClient
        .get("/api/groups")
        .then((response) => {
          console.log("API response:", response.data);
        })
        .catch((error) => {
          console.error("API error:", error);
        });
  }, []);

  return (
      <div>
        <h1>StudyHive</h1>
        <p>Place to find or host study sessions in your area!</p>
      </div>
  );
}

export default App;