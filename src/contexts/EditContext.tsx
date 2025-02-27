import { createContext, useContext, useState } from 'react';

interface EditContextType {
  isEditing: boolean;
  editingBookingId: string | null;
  setEditMode: (bookingId: string | null) => void;
}

const EditContext = createContext<EditContextType>({
  isEditing: false,
  editingBookingId: null,
  setEditMode: () => {},
});

export const EditProvider = ({ children }: { children: React.ReactNode }) => {
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

  const setEditMode = (bookingId: string | null) => {
    setEditingBookingId(bookingId);
  };

  return (
    <EditContext.Provider value={{
      isEditing: !!editingBookingId,
      editingBookingId,
      setEditMode,
    }}>
      {children}
    </EditContext.Provider>
  );
};

export const useEdit = () => useContext(EditContext);
