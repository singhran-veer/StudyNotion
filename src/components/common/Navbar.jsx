import React, { useEffect, useState} from 'react'
import logo from '../../assets/Logo/Logo-Full-Light.png'
import { Link, matchPath} from 'react-router-dom'
import {NavbarLinks} from '../../data/navbar-links'
import {IoIosArrowDown} from "react-icons/io"
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AiOutlineMenu, AiOutlineShoppingCart } from 'react-icons/ai'
import ProfileDropdown from '../core/Auth/ProfileDropDown'
import { apiConnector } from '../../services/apiconnector'
import { categories } from '../../services/apis'
import { ACCOUNT_TYPE } from '../../utils/constants'
const Navbar = () => {
    const {token}=useSelector((state)=>state.auth);
    const {user}=useSelector((state)=>state.profile);
    const {cart} = useSelector((state)=> state.cart);
    const {totalItems}=useSelector((state)=>state.cart);

    const [subLinks, setSubLinks]  = useState([]);
    const [loading,setLoading]=useState(false);

    const fetchSubLinks=async()=>{
        setLoading(true);
        try{
            const result=await apiConnector("GET",categories.CATEGORIES_API);
            setSubLinks(result?.data?.allCategories ?? []);
        }
        catch(err){
            console.log("Could not fetch the catgories,",err);
        }
        setLoading(false);
    }

    useEffect(()=>{
        fetchSubLinks();
    }, [])

    const location = useLocation();
    const matchRoute = (route) => {
        return matchPath({path:route}, location.pathname);
    }
    

  return (
    <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'> 
        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
            <Link to='/'>
                <img src={logo} width={160} height={42} loading='lazy'/>
            </Link>

            {/* nav links */}

            <nav>
                <ul className=' hidden md:flex gap-x-6 text-richblack-25'>
                    {
                        NavbarLinks.map((link,index)=>(
                            <li key={index}>
                                {
                                    link.title === "Catalog" ? (
                                        <div className='relative flex items-center gap-2 group'>
                                            <p>{link.title}</p>
                                            <IoIosArrowDown/>

                                            <div className={`invisible absolute left-[50%] 
                                                translate-x-[-49%] ${subLinks.length ? "translate-y-[15%]" : "translate-y-[40%]"}
                                            top-[50%] z-50 
                                            flex flex-col rounded-md bg-richblack-5 p-4 text-richblack-900
                                            opacity-0 transition-all duration-200 group-hover:visible
                                            group-hover:opacity-100 lg:w-[300px]`}>

                                            <div className='absolute left-[50%] top-0
                                            translate-x-[80%]
                                            translate-y-[-45%] h-6 w-6 rotate-45 rounded bg-richblack-5'>
                                            </div>

                                            {
                                                subLinks.length ? (
                                                        subLinks.map( (subLink, index) => (
                                                            <Link className='rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50' to={`catalog/${subLink.name.split(" ").join("-").toLowerCase()}`} key={index}>
                                                                <p>{subLink.name}</p>
                                                            </Link>
                                                        ) )
                                                ) : (<span className="loader"></span>)
                                            }

                                            </div> 


                                        </div>

                                    ) : (
                                        <Link to={link?.path}>
                                            <p className={`${ matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>
                                                {link.title}
                                            </p>
                                            
                                        </Link>
                                    )
                                }


                            </li>
                        ))
                    }

                </ul>

                
            </nav>

            <div className="hidden items-center gap-x-4 md:flex">
                {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                    <Link to="/dashboard/cart" className="relative">
                    <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                    {totalItems > 0 && (
                        <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                        {totalItems}
                        </span>
                    )}
                    </Link>
                )}
                {token === null && (
                    <Link to="/login">
                    <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                        Log in
                    </button>
                    </Link>
                )}
                {token === null && (
                    <Link to="/signup">
                    <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                        Sign up
                    </button>
                    </Link>
                )}
                {token !== null && <ProfileDropdown />}
            </div>
            <button className="mr-4 md:hidden">
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
            </button>
        </div>
    </div>
  )
}

export default Navbar
