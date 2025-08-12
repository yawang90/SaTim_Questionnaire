import {useState} from 'react';
import {useTranslation} from "react-i18next";
import MainLayout from "../layouts/MainLayout.tsx";

const DashboardPage = () => {
    const {t} = useTranslation();
    const userId = localStorage.getItem('userId');
    const [loading, setLoading] = useState(false);

    return (<MainLayout>
                Hello
        </MainLayout>
    );
};

export default DashboardPage;
