import { useState, useEffect } from "react";

function Advertisement() {
  const [advertisements, setAdvertisements] = useState([]);

  useEffect(() => {
   const fetchAdvertisementData = async () => {
      try {
        const response = await fetch('../advertisments.json');
        if (!response.ok) throw new Error('Failed to fetch advertisements');
        const data = await response.json();
        setAdvertisements(data);
      } catch (error) {
        console.error('Error fetching advertisements:', error);
      }
    };

    fetchAdvertisementData(); // Call the function
  }, []); // Dependency array to ensure the effect runs only once

  return (
    <div className="running-banner">
      <div className="marquee">
        {advertisements.map((ad, index) => (
          <a key={index} href={ad.link}>{ad.message}</a>
        ))}
      </div>
    </div>
  );
}

export default Advertisement;
