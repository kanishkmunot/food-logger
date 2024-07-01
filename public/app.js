// Add event listener to the form to handle form submission
document.getElementById('foodForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get the values from the input fields
    const foodName = document.getElementById('foodName').value;
    const foodImage = document.getElementById('foodImage').files[0];

    // Check if the inputs are not empty
    if (!foodName || !foodImage) {
        alert('Please enter a food name and select an image.');
        return;
    }

    // Create a FormData object to send the form data
    const formData = new FormData();
    formData.append('foodName', foodName);
    formData.append('foodImage', foodImage);

    // Use the fetch API to send the form data to the server
    fetch('/api/food', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Clear the input fields
            document.getElementById('foodName').value = '';
            document.getElementById('foodImage').value = '';
            // Reload the list of food entries
            loadFoodEntries();
        } else {
            throw new Error('Failed to add food.'); // Throw an error for non-200 status codes
        }
    })
    .catch(error => {
        console.error('Error adding food:', error);
        alert('Failed to add food.');
    });
});

// Function to load food entries from the server and display them
function loadFoodEntries() {
    fetch('/api/food')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch food entries.'); // Throw an error for non-200 status codes
        }
        return response.json();
    })
    .then(foodEntries => {
        const foodList = document.getElementById('foodList');
        foodList.innerHTML = ''; 

        foodEntries.forEach(entry => {
            const foodDiv = document.createElement('div');
            foodDiv.className = 'food-entry'; 

            const foodName = document.createElement('h3');
            foodName.textContent = entry.name;

            const foodImage = document.createElement('img');
            foodImage.src = `/uploads/${entry.image}`;
            foodImage.alt = entry.name;

            const foodTimestamp = document.createElement('p');
            foodTimestamp.textContent = new Date(entry.timestamp).toLocaleString();

            foodDiv.appendChild(foodName);
            foodDiv.appendChild(foodImage);
            foodDiv.appendChild(foodTimestamp);
            foodList.appendChild(foodDiv);
        });
    })
    .catch(error => {
        console.error('Error loading food entries:', error);
        alert('Failed to load food entries.');
    });
}

// Initial load of food entries
loadFoodEntries();
