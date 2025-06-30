import { useState, useEffect, useRef } from 'react';

export default function GymProgressTracker({ exercises = [] }) {
    const [hoveredDay, setHoveredDay] = useState(null);
    const trackerRef = useRef(null);

    // Handle clicking outside to close tooltip
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (trackerRef.current && !trackerRef.current.contains(event.target)) {
                setHoveredDay(null);
            }
        };

        if (hoveredDay) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [hoveredDay]);

    // Get the last 12 weeks (84 days) of data
    const getLastNDays = (n) => {
        const days = [];
        const today = new Date();
        
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        
        return days;
    };

    // Group exercises by date and workout type
    const getExerciseData = () => {
        const exercisesByDate = {};
        
        if (exercises && exercises.length > 0) {
            exercises.forEach(exercise => {
                const date = exercise.logged_at.split('T')[0];
                
                if (!exercisesByDate[date]) {
                    exercisesByDate[date] = new Set();
                }
                
                exercisesByDate[date].add(exercise.workout_type);
            });
        }
        
        return exercisesByDate;
    };

    const exerciseData = getExerciseData();
    const last84Days = getLastNDays(84);

    // Get intensity level based on number of different workout types
    const getIntensityLevel = (date) => {
        const workoutTypes = exerciseData[date];
        if (!workoutTypes) return 0;
        
        const count = workoutTypes.size;
        if (count === 1) return 1; // 0.3 opacity
        if (count === 2) return 2; // 0.7 opacity
        if (count >= 3) return 3; // 1.0 opacity
        return 0;
    };

    // Get CSS class based on intensity
    const getIntensityClass = (level) => {
        switch (level) {
            case 1: return 'intensity-1';
            case 2: return 'intensity-2';
            case 3: return 'intensity-3';
            default: return 'intensity-0';
        }
    };

    // Format date for tooltip
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get workout types for a date
    const getWorkoutTypes = (date) => {
        const types = exerciseData[date];
        return types ? Array.from(types) : [];
    };

    // Group days into weeks with month information
    const groupIntoWeeksWithMonths = (days) => {
        const weeks = [];
        const monthLabels = [];
        
        for (let i = 0; i < days.length; i += 7) {
            const week = days.slice(i, i + 7);
            weeks.push(week);
            
            // Get the month for the first day of the week
            const firstDay = new Date(week[0]);
            const monthName = firstDay.toLocaleDateString('en-US', { month: 'short' });
            
            // Check if this is a new month
            const prevWeek = weeks[weeks.length - 2];
            let showMonth = false;
            
            if (!prevWeek) {
                // First week
                showMonth = true;
            } else {
                const prevFirstDay = new Date(prevWeek[0]);
                const prevMonth = prevFirstDay.getMonth();
                const currentMonth = firstDay.getMonth();
                
                if (prevMonth !== currentMonth) {
                    showMonth = true;
                }
            }
            
            monthLabels.push(showMonth ? monthName : '');
        }
        
        return { weeks, monthLabels };
    };

    const { weeks, monthLabels } = groupIntoWeeksWithMonths(last84Days);

    return (
        <div 
            ref={trackerRef}
            style={{
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                width: '100%'
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <h3 style={{
                    color: '#ffffff77',
                    fontWeight: '600',
                    margin: 0
                }}>
                    Exercise Activity
                </h3>
            </div>
            
            {/* Month labels */}
            <div style={{
                display: 'flex',
                width: '100%',
                marginBottom: '8px'
            }}>
                {monthLabels.map((month, index) => (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            fontSize: '12px',
                            color: '#ffffff99',
                            textAlign: 'center',
                            minHeight: '16px'
                        }}
                    >
                        {month}
                    </div>
                ))}
            </div>
            
            <div style={{
                display: 'flex',
                width: '100%',
                gap: '2px',
                overflowX: 'auto',
                paddingBottom: '5px'
            }}>
                {weeks.map((week, weekIndex) => (
                    <div
                        key={weekIndex}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            flex: 1,
                            alignItems: 'center'
                        }}
                    >
                        {week.map((day, dayIndex) => {
                            const intensityLevel = getIntensityLevel(day);
                            const workoutTypes = getWorkoutTypes(day);
                            
                            const getIntensityStyle = (level) => {
                                const baseStyle = {
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '2px',
                                    border: '1px solid #e1e4e853',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                };
                                
                                switch (level) {
                                    case 1:
                                        return { ...baseStyle, backgroundColor: '#4caf50', opacity: 0.3 };
                                    case 2:
                                        return { ...baseStyle, backgroundColor: '#4caf50', opacity: 0.7 };
                                    case 3:
                                        return { ...baseStyle, backgroundColor: '#4caf50', opacity: 1 };
                                    default:
                                        return { ...baseStyle, backgroundColor: '#ebedf02b' };
                                }
                            };
                            
                            return (
                                <div
                                    key={dayIndex}
                                    style={getIntensityStyle(intensityLevel)}
                                    onMouseEnter={() => setHoveredDay(day)}
                                    onMouseLeave={() => setHoveredDay(null)}
                                    title={`${formatDate(day)}: ${workoutTypes.length > 0 ? workoutTypes.join(', ') : 'No exercises'}`}
                                >
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            
            {hoveredDay && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    marginBottom: '8px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        marginBottom: '4px'
                    }}>
                        {formatDate(hoveredDay)}
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        flexWrap: 'wrap'
                    }}>
                        {getWorkoutTypes(hoveredDay).length > 0 
                            ? getWorkoutTypes(hoveredDay).map(type => {
                                const getWorkoutStyle = (workoutType) => {
                                    const baseStyle = {
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        fontSize: '10px',
                                        textTransform: 'capitalize'
                                    };
                                    
                                    switch (workoutType) {
                                        case 'weights':
                                            return { ...baseStyle, background: 'rgba(255, 193, 7, 0.3)' };
                                        case 'cardio':
                                            return { ...baseStyle, background: 'rgba(233, 30, 99, 0.3)' };
                                        case 'mobility':
                                            return { ...baseStyle, background: 'rgba(3, 169, 244, 0.3)' };
                                        default:
                                            return { ...baseStyle, background: 'rgba(255, 255, 255, 0.2)' };
                                    }
                                };
                                
                                return (
                                    <span key={type} style={getWorkoutStyle(type)}>
                                        {type}
                                    </span>
                                );
                            })
                            : 'No exercises'
                        }
                    </div>
                    {/* Tooltip arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        border: '4px solid transparent',
                        borderTopColor: 'rgba(0, 0, 0, 0.9)'
                    }}></div>
                </div>
            )}
        </div>
    );
}