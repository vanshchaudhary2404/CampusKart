import { Router } from "express";
import { generateProductDescription, suggestProductPrice, moderateProductListing,} from "../gemini.js";

const router = Router();

router.post("/generate-description", async (req, res) => {
  try {
    const {
      name,
      category,
      condition,
      originalPrice,
      age,
      extraDetails,
    } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "Product name is required.",
      });
    }

    if (name.trim().length > 150) {
      return res.status(400).json({
        error: "Product name must be 150 characters or fewer.",
      });
    }

    if (
      originalPrice !== undefined &&
      originalPrice !== null &&
      (
        typeof originalPrice !== "number" ||
        !Number.isFinite(originalPrice) ||
        originalPrice < 0
      )
    ) {
      return res.status(400).json({
        error: "Original price must be a non-negative number.",
      });
    }

    const product = {
      name: name.trim(),
      category:
        typeof category === "string" ? category.slice(0, 100) : "",
      condition:
        typeof condition === "string" ? condition.slice(0, 100) : "",
      originalPrice,
      age: typeof age === "string" ? age.slice(0, 100) : "",
      extraDetails:
        typeof extraDetails === "string"
          ? extraDetails.slice(0, 1000)
          : "",
    };

    const description = await generateProductDescription(product);

    return res.json({ description });
  } catch (error) {
    console.error("AI description error:", error.message);

    return res.status(500).json({
      error: "Description generation failed. Check the AI service logs.",
    });
  }
});

router.post("/suggest-price", async (req, res) => {
  try {
    const {
      name,
      category,
      condition,
      originalPrice,
      age,
    } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "Product name is required.",
      });
    }

    if (
      typeof originalPrice !== "number" ||
      !Number.isFinite(originalPrice) ||
      originalPrice <= 0
    ) {
      return res.status(400).json({
        error: "A valid original price is required.",
      });
    }

    const product = {
      name: name.trim().slice(0, 150),
      category:
        typeof category === "string" ? category.slice(0, 100) : "",
      condition:
        typeof condition === "string" ? condition.slice(0, 100) : "",
      originalPrice,
      age: typeof age === "string" ? age.slice(0, 100) : "",
    };

    const suggestedPrice = await suggestProductPrice(product);

    return res.json({ suggestedPrice });
  } catch (error) {
    console.error("AI price suggestion error:", error.message);

    return res.status(500).json({
      error: "Price suggestion failed. Check the AI service logs.",
    });
  }
});


router.post("/moderate-listing", async (req, res) => {
  try {
    const { title, category, condition, description } = req.body ?? {};

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Product title is required." });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({ error: "Product title is too long." });
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || description.length > 3000)
    ) {
      return res.status(400).json({ error: "Invalid product description." });
    }

    const result = await moderateProductListing({
      title: title.trim(),
      category: typeof category === "string" ? category.slice(0, 100) : "",
      condition: typeof condition === "string" ? condition.slice(0, 100) : "",
      description: typeof description === "string" ? description : "",
    });

    return res.json(result);
  } catch (error) {
    console.error("AI moderation error:", error.message);
    return res.status(500).json({
      error: "Moderation failed. Check the AI service logs.",
    });
  }
});



export default router;
