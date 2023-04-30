import { db } from '~/lib/db'

export default function Modules() {
    return (   
        <div>
            <h1>All my posts</h1>
            <ul>
            <h1>{db.modules['angles']['power-consumption']['milliamps-positive-12-volts']}</h1> 
            </ul>
        </div>
    )
};
 
