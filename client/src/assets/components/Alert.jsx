import { AlertTriangle, Droplet, Droplets, Flame, Wind } from 'lucide-react';
import Sensor from './Sensor';

const Alert = ({ sensorData, darkMode }) => {
  return (
    <div
      className={`${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'
      } rounded-xl shadow-lg p-6 border border-transparent`}
    >
      <h2
        className={`${
          darkMode ? 'text-slate-50' : 'text-slate-900'
        } text-xl font-bold mb-6 flex items-center`}
      >
        <AlertTriangle className="mr-2 text-red-500" size={20} />
        Rain Fire Alert System
      </h2>

      <div>
        {/* Rain Sensor */}
        <Sensor
          sensorDetected={sensorData.rainDetected}
          sensorName="Sensor Hujan"
          icon={Droplet}
          alertType=""
          trueCondition="Hujan terdeteksi!"
          falseCondition="Hujan tidak terdeteksi!"
          trueStatus="HUJAN"
          falseStatus="CERAH"
          darkMode={darkMode}
        />

        {/* Fire Sensor */}
        <Sensor
          sensorDetected={sensorData.fireDetected}
          sensorName="Sensor Api"
          icon={Flame}
          alertType="red"
          trueCondition="Api terdeteksi!"
          falseCondition="Api tidak terdeteksi!"
          trueStatus="BAHAYA"
          falseStatus="AMAN"
          darkMode={darkMode}
        />
        
        {/* Gas  Sensor */}
        <Sensor
          sensorDetected={sensorData.gasDetected}
          sensorName="Sensor Gas"
          icon={Wind}
          alertType="red"
          trueCondition="Gas terdeteksi!"
          falseCondition="Gas tidak terdeteksi!"
          trueStatus="BAHAYA"
          falseStatus="AMAN"
          darkMode={darkMode}
        />

        {/* System Status */}
        {/* <SystemStatus data={sensorData} darkMode={darkMode} /> */}
      </div>
    </div>
  );
};

export default Alert;