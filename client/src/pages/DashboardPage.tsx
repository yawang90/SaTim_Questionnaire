import {useState} from 'react';
import {useTranslation} from "react-i18next";

const DashboardPage = () => {
    const {t} = useTranslation();
    const userId = localStorage.getItem('userId');
    const [loading, setLoading] = useState(false);

    return (<>
                Hello
        </>
    );
};

export default DashboardPage;
