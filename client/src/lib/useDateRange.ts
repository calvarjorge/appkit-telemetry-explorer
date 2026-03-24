import { useState } from 'react';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useDateRange() {
  const [startDate, setStartDate] = useState(yesterdayStr());
  const [endDate, setEndDate] = useState(todayStr());
  return { startDate, endDate, setStartDate, setEndDate };
}
