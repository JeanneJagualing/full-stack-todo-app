import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Switch } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';

const API_URL = 'http://192.168.1.100:8000'; // Replace with your backend URL

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
    Roboto_400Regular,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === '') return;
    try {
      const response = await axios.post(`${API_URL}/tasks`, { title: newTask });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      console.error('Add error:', error);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const task = tasks.find(t => t.id === id);
      const response = await axios.put(`${API_URL}/tasks/${id}`, { title: task.title, completed: !completed });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.title);
  };

  const saveTask = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      const response = await axios.put(`${API_URL}/tasks/${id}`, { title: editingText, completed: task.completed });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
      setEditingTaskId(null);
      setEditingText('');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const lightTheme = {
    background: '#FFF0F5',    // Very light pink
    text: '#333333',         // Dark gray
    primary: '#FF69B4',      // Soft pink
    secondary: '#E6E6FA',    // Light lavender
    accent: '#98FF98',       // Mint green
    border: '#FF69B4',       // Soft pink
  };

  const darkTheme = {
    background: '#301934',   // Dark purple
    text: '#FFFFFF',         // White
    primary: '#FF69B4',      // Soft pink
    secondary: '#9370DB',    // Medium purple
    accent: '#98FF98',       // Mint green
    border: '#9370DB',       // Medium purple
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    header: {
      fontSize: 24,
      fontFamily: 'Pacifico_400Regular',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    themeToggle: {
      alignItems: 'flex-end',
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      color: theme.text,
      backgroundColor: theme.background,
      fontFamily: 'Roboto_400Regular',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.accent,
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
      justifyContent: 'center',
    },
    addButtonText: {
      color: theme.text,
      marginLeft: 5,
      fontFamily: 'Roboto_400Regular',
    },
    filterButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    filterButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: theme.secondary,
    },
    activeFilter: {
      borderWidth: 2,
      borderColor: theme.accent,
    },
    filterText: {
      color: theme.text,
      fontFamily: 'Roboto_400Regular',
    },
    taskItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: theme.secondary,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    taskText: {
      color: theme.text,
      flex: 1,
      fontFamily: 'Roboto_400Regular',
    },
    actionButton: {
      backgroundColor: theme.primary,
      padding: 5,
      borderRadius: 5,
      marginLeft: 5,
    },
    actionText: {
      color: theme.text,
      fontFamily: 'Roboto_400Regular',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>
      <View style={styles.themeToggle}>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>
      <TextInput
        style={styles.input}
        value={newTask}
        onChangeText={setNewTask}
        placeholder="Add a new task"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Icon name="plus" size={20} color={theme.text} />
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
          onPress={() => setFilter('active')}
        >
          <Text style={styles.filterText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={styles.filterText}>Completed</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            {editingTaskId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => saveTask(item.id)}>
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.taskText}>{item.title}</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => startEditing(item)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
            <Switch
              value={item.completed}
              onValueChange={() => toggleTask(item.id, item.completed)}
              thumbColor={item.completed ? theme.accent : '#f4f3f4'}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
            <TouchableOpacity style={styles.actionButton} onPress={() => deleteTask(item.id)}>
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

export default App;