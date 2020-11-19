import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listLikes } from './graphql/queries';
import { createLike as createLikeMutation, deleteLike as deleteLikeMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [likes, setLikes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchLikes();
  }, []);

  // This function uses the API class to send a query to the GraphQL API and retrieve a list of likes.
  async function fetchLikes() {
    const apiData = await API.graphql({ query: listLikes });
    setLikes(apiData.data.listLikes.items);
  }

  // Uses the API class to send a mutation to the GraphQL API passing in the variables needed for a GraphQL
  // mutation so that a new like can be created with the form data.
  async function createLike() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createLikeMutation, variables: { input: formData } });
    setLikes([ ...likes, formData ]);
    setFormData(initialFormState);
  }

  // This function is sending a GraphQL mutation along with some variables to delete a like.
  async function deleteLike({ id }) {
    const newLikesArray = likes.filter(like => like.id !== id);
    setLikes(newLikesArray);
    await API.graphql({ query: deleteLikeMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>Like It Like This</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'type': e.target.value})}
        placeholder="Type (Movie or TV Show)"
        value={formData.type}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Description"
        value={formData.description}
      />
      <button onClick={createLike}>Create Like</button>
      <div style={{marginBottom: 30}}>
        {
          likes.map(like => (
            <div key={like.id || like.name}>
              <h2>{like.name}</h2>
              <h4>{like.type}</h4>
              <p>{like.description}</p>
              <button onClick={() => deleteLike(like)}>Delete like</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);