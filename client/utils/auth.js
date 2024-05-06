// import { BASE_URL } from "../src/stores/apiConfig.js";

/* export async function login() {

  try {
    const response = await fetch(`${$BASE_URL}/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      toast.success('Oprettelse vellykket!');
      itemList.update((currentItems) => {
        return [...currentItems, result.data];
      });

      showAddModal.set(false);
    } else {
      throw new Error(result.message || 'Oprettelse mislykkedes');
    }
  } catch (error) {
    console.error('Error updating item:', error);
    toast.error('Fejl ved opdatering:', error.message);
  }
}


} */
