import { TimerReset } from "lucide-react";
import {useRef, useEffect, useCallback} from "react"

type Timer = ReturnType<typeof setTimeout>

export function useDebounceHook<T extends (...args:any[])=>void>(
    func:T,
    delay:number
){
    const timer  = useRef<Timer|null>(null)

    const debouncedFunc = useCallback((...args:Parameters<T>)=>{
        if(timer.current!==null){
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(()=>{
            func(...args)
        },delay)
    },[func,delay])

    return debouncedFunc
}