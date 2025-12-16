import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Recommendations({ userId }) {0
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/recommend/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data);
      })
      .catch((err) => console.error("Error fetching recommendations:", err));
  }, [userId]);

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">Recommended For You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Card key={product._id} className="shadow-md rounded-xl">
            <CardContent className="p-4">
              <img
                src={product.image || "https://via.placeholder.com/150"}
                alt={product.name}
                className="w-full h-32 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
              <p className="text-gray-600">₹{product.price}</p>
              <Button className="mt-2 w-full">Add to Cart</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
