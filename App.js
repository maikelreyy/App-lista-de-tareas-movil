import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [alarmas, setAlarmas] = useState([]);
  const [hora, setHora] = useState('');

  const agregarTarea = () => {
    if (nuevaTarea !== '') {
      setTareas([...tareas, nuevaTarea]);
      setAlarmas([...alarmas, '']);
      setNuevaTarea('');
    }
  };

  const completarTarea = (index) => {
    const nuevasTareas = [...tareas];
    nuevasTareas[index] = '✓ ' + nuevasTareas[index];
    setTareas(nuevasTareas);
  };

  const eliminarTarea = (index) => {
    const nuevasTareas = [...tareas];
    nuevasTareas.splice(index, 1);
    setTareas(nuevasTareas);

    const nuevasAlarmas = [...alarmas];
    nuevasAlarmas.splice(index, 1);
    setAlarmas(nuevasAlarmas);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      agregarTarea();
    }
  };

  const actualizarAlarma = (index, horaAlarma) => {
    const nuevasAlarmas = [...alarmas];
    nuevasAlarmas[index] = horaAlarma;
    setAlarmas(nuevasAlarmas);
  };

  useEffect(() => {
    const obtenerHora = () => {
      const fecha = new Date().toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
      setHora(fecha);
    };

    const interval = setInterval(() => {
      obtenerHora();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const tareasProgramadas = [];

    alarmas.forEach((alarma, index) => {
      if (alarma) {
        const tareaProgramada = Notifications.scheduleNotificationAsync({
          content: {
            title: '¡Alarma!',
            body: tareas[index],
          },
          trigger: {
            hour: parseInt(alarma.split(':')[0], 10),
            minute: parseInt(alarma.split(':')[1], 10),
          },
        });
        tareasProgramadas.push(tareaProgramada);
      }
    });

    return () => {
      tareasProgramadas.forEach((tareaProgramada) => Notifications.cancelScheduledNotificationAsync(tareaProgramada));
    };
  }, [alarmas, tareas]);

  const renderTarea = (tarea, index) => {
    if (tarea.startsWith('✓')) {
      return (
        <View style={styles.listItem} key={index}>
          <Text>{tarea}</Text>
          <TouchableOpacity style={styles.button} onPress={() => eliminarTarea(index)}>
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.listItem} key={index}>
          <Text style={styles.pendingAnimation}>{tarea}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => completarTarea(index)}>
              <Text style={styles.buttonText}>Completada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => eliminarTarea(index)}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Lista de Tareas</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nueva Tarea"
          value={nuevaTarea}
          onChangeText={(text) => setNuevaTarea(text)}
          onSubmitEditing={agregarTarea}
        />
        <TouchableOpacity style={styles.addButton} onPress={agregarTarea}>
          <Text style={styles.buttonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.listContainer}>
        {tareas.map((tarea, index) => renderTarea(tarea, index))}
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#dc3545',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginLeft: 5,
  },
  pendingAnimation: {
    // Add your animation styles here
  },
};
