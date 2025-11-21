"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function TaskModal({ task, onSave, onClose, onDelete }) {
  const [formData, setFormData] = useState(
    task || {
      title: "",
      description: "",
      priority: "Medium", // Default sesuai gambar
      category: "Work", // Default sesuai gambar
      date: "",
    }
  );

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium", // Default untuk task baru
        category: "Work", // Default untuk task baru
        date: "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: task ? task.id : crypto.randomUUID() });
  };

  const inputStyle =
    "w-full rounded-lg bg-white px-3 py-2 text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400";
  const labelStyle = "block text-sm font-medium text-gray-800 mb-1";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelStyle}>
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              className={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelStyle}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add task description (optional)..."
              className={`${inputStyle} min-h-[100px]`}
              rows={4}
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputStyle}
              >
                {/* <option value="" disabled>Select priority</option> */}
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputStyle}
              >
                {/* <option value="" disabled>Select category</option> */}
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Study">Study</option>
                <option value="Family">Family</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className={labelStyle}>
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#FBBF24] hover:bg-yellow-400 text-black font-medium py-2 px-4 rounded-lg transition"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>

          {task && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="w-full mt-2 py-2 text-red-600 hover:text-red-700 text-sm"
            >
              Delete Task
            </button>
          )}
        </form>
      </div>
    </div>
  );
}