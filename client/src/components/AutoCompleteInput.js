import React, { useState } from 'react';

const AutocompleteInput = ({ dataList, onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [error, setError] = useState(false);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    const matchingItem = dataList.find(item =>
      item.name.toLowerCase() === value.toLowerCase()
    );

    if (matchingItem) {
      setSelectedItemId(matchingItem.id);
      setSelectedItemName(matchingItem.name);
      setError(false);
      onSelect(matchingItem.id); // Aufruf der übergebenen Methode mit der ID
    } else {
      setSelectedItemId('');
      setSelectedItemName('');
    }
  };

  const handleItemSelect = (itemId, itemName) => {
    setSelectedItemId(itemId);
    setInputValue(itemName);
    setSelectedItemName(itemName);
    setError(false);
    onSelect(itemId); // Aufruf der übergebenen Methode mit der ID
  };

  const handleBlur = () => {
    if (!selectedItemId) {
      setError(true);
    }
  };

  const filteredItems = dataList.filter(item =>
    item.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className='autoCompleteInputWrapper'>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={error ? 'error autoCompleteInput' : 'autoCompleteInput'}
      />
      <div className='autoCompleteList'>
        {filteredItems.map(item => (
          <span key={item.id} onClick={() => handleItemSelect(item.id, item.name)}>
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AutocompleteInput;
