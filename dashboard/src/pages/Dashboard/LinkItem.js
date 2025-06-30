import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const LinkItem = ({ href, icon: Icon, text, badge, dropdown }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <li>
      <Link to={href}
        className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
        onClick={dropdown ? toggleDropdown : undefined}
      >
        <Icon className='mr-2' />
        <span className='flex-1 me-3'>{text}</span>
        {badge && (
          <span className={`inline-flex items-center justify-center px-2 ms-3 text-sm font-medium rounded-full ${badge.color} ${badge.darkColor}`}>
            {badge.text}
          </span>
        )}
        {dropdown && (
          <span>{isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}</span>
        )}
      </Link>

      {dropdown && isOpen && (
        <ul className='pl-6 mt-1 space-y-1'>
          {dropdown.map((item, index) => (
            <li key={index}>
              <Link
                to={`/dashboard/${item.toLowerCase().replace(/\s+/g, '-')}`}
                className='flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              >
                <span>{item}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default LinkItem;
