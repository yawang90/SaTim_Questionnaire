import { useEffect, useState } from 'react';

export default function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/hello')
            .then(res => res.json())
            .then(data => setMessage(data.message))
            .catch(console.error);
    }, []);

    return <div>{message ? message : 'Loading...'}</div>;
}
