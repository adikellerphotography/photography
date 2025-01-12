import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Pricing() {
  const packages = [
    {
      name: "Basic Session",
      price: "$299",
      description: "Perfect for individual or couple photos",
      features: [
        "1 hour session",
        "1 location",
        "20 edited digital photos",
        "Online gallery"
      ]
    },
    {
      name: "Family Package",
      price: "$499",
      description: "Ideal for family portraits and events",
      features: [
        "2 hour session",
        "2 locations",
        "40 edited digital photos",
        "Online gallery",
        "Print release"
      ]
    },
    {
      name: "Event Coverage",
      price: "From $999",
      description: "Complete event photography service",
      features: [
        "Full day coverage",
        "Multiple locations",
        "100+ edited photos",
        "Online gallery",
        "Print release",
        "Rush delivery available"
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">Photography Packages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <p className="text-2xl font-bold">{pkg.price}</p>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <span className="mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
