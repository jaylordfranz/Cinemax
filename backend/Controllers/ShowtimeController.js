const Showtime = require("../Models/Showtime");

// Get all showtimes
exports.GetShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find().populate("movie"); // Populate movie details
    res.status(200).json({ success: true, data: showtimes });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

// Create a new showtime
exports.CreateShowtime = async (req, res) => {
  try {
    const { movie_id, theater_name, start_date, end_date, show_date } =
      req.body;

    // Validation: Ensure required fields are present
    if (
      !movie_id?.value ||
      !theater_name?.value ||
      !start_date ||
      !end_date ||
      !show_date
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Convert start and end date strings to Date objects
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate)) {
      return res.status(400).json({ message: "Invalid start date format." });
    }
    if (isNaN(endDate)) {
      return res.status(400).json({ message: "Invalid end date format." });
    }

    // Validate show_date format (it should be a valid date string)
    const showDate = new Date(show_date);
    if (isNaN(showDate)) {
      return res.status(400).json({ message: "Invalid show date format." });
    }

    // Validate that the end date is greater than or equal to the start date
    if (endDate < startDate) {
      return res.status(400).json({
        message: "End date must be greater than or equal to the start date.",
      });
    }

    // Create new ShowTime document
    try {
      const newShowTime = new Showtime({
        movie: movie_id.value, // Referencing the movie
        theater: theater_name.value, // Theater name
        showDateRange: {
          start: startDate,
          end: endDate,
        },
      });

      // Save the showtime to the database
      await newShowTime.save();

      // Return the success response
      res.status(201).json({
        message: "Showtime created successfully!",
        data: newShowTime,
      });
    } catch (error) {
      console.error("Error creating showtime:", error);
      res
        .status(500)
        .json({ message: "Server error, could not create showtime." });
    }
  } catch (error) {
    console.error("Error creating schedule:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while creating the schedule." });
  }
};

// Update an existing showtime
exports.UpdateShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate date range if updated
    if (updates.showDateRange) {
      const { start, end } = updates.showDateRange;
      if (!start || !end) {
        return res.status(400).json({
          success: false,
          message: "Both start and end dates are required in showDateRange.",
        });
      }
      if (new Date(end) < new Date(start)) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be earlier than start date.",
        });
      }
    }

    // Find and update the showtime
    const updatedShowtime = await Showtime.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Ensure model validations are applied
    });

    if (!updatedShowtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedShowtime,
      message: "Showtime updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

// Delete a showtime
exports.deleteShowtime = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the showtime
    const deletedShowtime = await Showtime.findByIdAndDelete(id);

    if (!deletedShowtime) {
      return res
        .status(404)
        .json({ success: false, message: "Showtime not found" });
    }

    res.status(200).json({
      success: true,
      data: deletedShowtime,
      message: "Showtime deleted successfully",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
