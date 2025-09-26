import StatusCard from '../components/StatusCard';
import Alert from '../components/Alert';
import { Lightbulb, Wind, Activity, Flame } from 'lucide-react';

const Sensor = ({ darkMode, sensorData }) => {

  return (
    <div>
      {/* Sensor card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard
          title="Flame"
          value={`${sensorData.fireDetected ? 'DETECTED' : 'CLEAR'}`}
          icon={Flame}
          colorClass="red"
          isDark={darkMode}
        />
        <StatusCard
          title="Gas"
          value={`${sensorData.gasDetected ? 'DETECTED' : 'CLEAR'}`}
          icon={Wind}
          colorClass="blue"
          isDark={darkMode}
        />
        <StatusCard
          title="Tingkat Cahaya"
          value={`${sensorData.lightLevel.toFixed(0)}%`}
          icon={Activity}
          status={sensorData.lightLevel < 30 ? 'LOW' : 'NORMAL'}
          colorClass="yellow"
          isDark={darkMode}
        />
        <StatusCard
          title="Status Lampu"
          value="Lampu Utama"
          icon={Lightbulb}
          status={sensorData.lampStatus ? 'ON' : 'OFF'}
          colorClass={sensorData.lampStatus ? 'green' : 'gray'}
          isDark={darkMode}
        />
      </div>

      {/* Alert System */}
      <Alert sensorData={sensorData} darkMode={darkMode} />
    </div>
  )
}

export default Sensor