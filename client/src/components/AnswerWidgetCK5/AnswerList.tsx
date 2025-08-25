// react/productlist.js
import AnswerPreview from "./AnswerPreview.tsx";

export default function AnswerList(answers ) {
    return (
        <div className='app__product-list'>
            <h3>Products</h3>
            <ul>
                {answers.map( ( product ) => {
                    return (
                        <li key={ product.id }>
                            <AnswerPreview
                                id={ product.id }
                                onClick={ answers.onClick }
                                { ...product }
                            />
                        </li>
                    );
                })}
            </ul>
            <p><b>Tip</b>: Clicking the product will add it to the editor.</p>
        </div>
    );
}
