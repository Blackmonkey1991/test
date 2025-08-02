import { RequestHandler } from "express";
import { ApiResponse, DisplayOverrideRequest } from "@shared/types";
import { updateDisplayOverrides, getCurrentDrawing } from "../data/lottery";

export const handleUpdateDisplayOverrides: RequestHandler = (req, res) => {
  try {
    const { title, date, time }: DisplayOverrideRequest = req.body;

    const success = updateDisplayOverrides({ title, date, time });

    if (success) {
      const currentDrawing = getCurrentDrawing();
      const response: ApiResponse<any> = {
        success: true,
        data: {
          message: "Display overrides updated successfully",
          displayOverrides: currentDrawing?.displayOverrides,
        },
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: "No active drawing found",
      };
      res.status(404).json(response);
    }
  } catch (error) {
    console.error("Error updating display overrides:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    res.status(500).json(response);
  }
};

export const handleGetDisplayOverrides: RequestHandler = (req, res) => {
  try {
    const currentDrawing = getCurrentDrawing();

    if (currentDrawing) {
      const response: ApiResponse<any> = {
        success: true,
        data: currentDrawing.displayOverrides || {},
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: "No active drawing found",
      };
      res.status(404).json(response);
    }
  } catch (error) {
    console.error("Error getting display overrides:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    res.status(500).json(response);
  }
};
