import {useRef, useEffect} from 'react';

function usePrevious(value: any, notNullish: boolean) {
    const ref = useRef();
    useEffect(() => {
        if (!notNullish) ref.current = value;
        else {
            if (value) {
                ref.current = value
            }
        }
    });
    return ref.current;
}
export default usePrevious;
