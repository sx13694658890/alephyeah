import { useState } from 'react';
import { useToggle } from 'usehooks-ts';

import { cn } from './lib/cn';

const App = () => {
  const [iconlist] = useState<string[]>(['svgicon--one', 'svgicon--two', 'svgicon--fill-msg']);
  const [isActive, toggle] = useToggle(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600">Hello World</h1>
      <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white" onClick={toggle}>
        {isActive ? 'Active' : 'Inactive'}
      </button>

      {iconlist.map((item) => (
        <span key={item} className={cn(`icon-[${item}] inline-block h-4 w-4`, isActive && 'text-red-500')} />
      ))}
    </div>
  );
};

export default App;
