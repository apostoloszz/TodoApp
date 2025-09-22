import React, { useState } from "react";
import { Input, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import "../styles/NoteSection.css";

const { TextArea } = Input;

const NoteSection = () => {
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveNote = () => {
    // In a real app, save the note to backend
    setIsEditing(false);
  };

  return (
    <div className="note-section">
      <div className="note-header">
        <h3>Note</h3>
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={toggleEdit}
          className="edit-note-button"
        />
      </div>
      <div className="note-content">
        {isEditing ? (
          <>
            <TextArea
              rows={4}
              value={note}
              onChange={handleNoteChange}
              placeholder="Write your note here..."
              className="note-textarea"
            />
            <Button
              type="primary"
              onClick={saveNote}
              className="save-note-button"
            >
              Save
            </Button>
          </>
        ) : (
          <div className="note-display">
            {note || "No notes added yet. Click the edit button to add a note."}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteSection;
