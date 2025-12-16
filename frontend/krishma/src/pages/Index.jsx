import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Star, Leaf, Truck } from "lucide-react";
import RunningAd from "../components/RunningAdd";

const Index = () => {
  const [products, setProducts] = useState([]);
  // console.log(products)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/products");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const features = [
    {
      title: "Farm Fresh Milk",
      description:
        "Directly sourced from local farms every day for maximum freshness and nutrition.",
      icon: <Droplet className="h-6 w-6 text-primary" />,
    },
    {
      title: "Eco-Friendly Packaging",
      description:
        "We care for the planet with biodegradable and recyclable packaging.",
      icon: <Leaf className="h-6 w-6 text-primary" />,
    },
    {
      title: "Trusted Quality",
      description:
        "Every product passes strict quality checks to ensure purity and safety.",
      icon: <Star className="h-6 w-6 text-primary" />,
    },
    {
      title: "Doorstep Delivery",
      description:
        "Enjoy hassle-free delivery straight to your home with flexible timings.",
      icon: <Truck className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-6xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
          Welcome to <span className="text-primary">Krishma Milk Products</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Delivering farm-fresh milk and dairy products to your doorstep with
          love, trust, and care.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/customer/signup">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button size="lg" className="px-6 py-5 text-base w-40">
                Sign Up
              </Button>
            </motion.div>
          </Link>
          <Link to="/customer/login">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                variant="outline"
                className="px-6 py-5 text-base w-40"
              >
                Login
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <h2 className="text-2xl md:text-4xl font-semibold text-center mb-12">
          Why Choose Us?
        </h2>
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition border border-border">
                <CardHeader className="flex flex-row items-center gap-3">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Running Banner */}
      <RunningAd />

      {/* Product Showcase */}
      <section className="py-16 px-4">
        <h2 className="text-2xl md:text-4xl font-semibold text-center mb-12">
          Our Bestselling Products
        </h2>
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to="/customer/products">
                <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition cursor-pointer border border-border">
                  {/* --- THIS IS THE FIX --- */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="py-20 px-4 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-2xl md:text-4xl font-semibold mb-4">
          Experience the Purity of Krishma Milk
        </h2>
        <p className="text-muted-foreground mb-6 text-sm md:text-base max-w-2xl mx-auto">
          From your morning tea to evening desserts, let every sip and bite be
          filled with freshness, trust, and care.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/customer/signup">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button size="lg" className="px-6 py-5 text-base w-40">
                Sign Up
              </Button>
            </motion.div>
          </Link>
          <Link to="/customer/login">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                variant="outline"
                className="px-6 py-5 text-base w-40"
              >
                Login
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-6 px-4 bg-muted/40 text-center text-xs md:text-sm text-muted-foreground"
      >
        <p>
          © {new Date().getFullYear()} Krishma Milk Products. All rights
          reserved. |{" "}
          <Link to="/admin/login" className="text-primary hover:underline">
            Admin Login
          </Link>
        </p>
      </motion.footer>
    </div>
  );
};

export default Index;