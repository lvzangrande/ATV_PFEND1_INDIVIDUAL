'use client';

import { useEffect, useState } from "react";

export default function Produtos(){
 const [listaProdutos, setListaProdutos] = useState([]);
 useEffect(()=> {
    setListaProdutos();
 }, [])   
}