import { BASE_URL } from '../stores/apiConfig.js';
import { displayNames } from '../stores/dictionaryStore.js';
import { get } from 'svelte/store';
import { headerKeysDanish, headerKeys } from '../stores/itemListStore.js';
import { selectionsLoading } from '../stores/generalStore.js';



export function getKeys(collection) {
if (get(headerKeysDanish).length === 0) {
    selectionsLoading.set(true);
    fetchHeaderKeys(collection)
    // .then(() => {
    //     const derivedHeaderKeys = derived(itemList, ($itemList) => {
    //         if ($itemList.length > 0) {
    //             return Object.keys($itemList[0]);
    //         } 
    //         return headerKeys;
    //     });

    //     derivedHeaderKeys.subscribe((keys) => {
    //         if (keys.length > 0) {
    //             setHeaderKeys(keys);
    //         }
    //     });
    // });
}
}

function setHeaderKeys(data) {
const excludeKeys = [
    '_id',
    'hashed_password',
    'reset_password_token',
    'reset_password_expires',
    '_id',
    'roomId',
    'teacherId',
    'locationId',
    'courseId',
    'courseName',
    'teacherEmail'
];

// 	Made in cooperation with chatgpt (Marcus)
const filteredKeys = data.filter(
    (key) => !excludeKeys.some((excludeKey) => key.endsWith(excludeKey) || key === excludeKey)
);
headerKeys.set(filteredKeys);
headerKeysDanish.set(filteredKeys.map((key) => get(displayNames)[key] == undefined ? key: get(displayNames)[key]));
selectionsLoading.set(false);
}

async function fetchHeaderKeys(collection) {
if (collection.includes('classrooms/available')) {
    collection = 'classrooms/available';
}
const response = await fetch(`${get(BASE_URL)}/headerKey/${collection}`, {
    credentials: 'include'
});

if (response.ok) {
    const result = await response.json();
    setHeaderKeys(result.data);
} else {
    console.error('Failed to fetch header keys from the server');
}

}