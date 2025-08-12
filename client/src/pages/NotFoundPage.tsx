import { Link } from 'react-router-dom';
import {useTranslation} from "react-i18next";

const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
            <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Oops!</h1>
                <p className="text-gray-600 text-lg mb-6">
                    {t("pageNotFound")}
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                    {t("pageReload")}
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
