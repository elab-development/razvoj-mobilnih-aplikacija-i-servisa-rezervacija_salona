import { StyleSheet, Text, View } from 'react-native';

import { themeFonts } from '@/constants/theme';
import type { ChartDatum } from '@/components/admin/statistics/useAdminStatistics';

type AdminBarChartProps = {
  title: string;
  data: ChartDatum[];
  valueSuffix?: string;
  formatValue?: (value: number) => string;
};

export function AdminBarChart({
  title,
  data,
  valueSuffix = '',
  formatValue = (value) => `${value}${valueSuffix}`,
}: AdminBarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {data.length === 0 || maxValue === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No data yet</Text>
        </View>
      ) : (
        <View style={styles.rows}>
          {data.map((item) => {
            const widthPercent = Math.max((item.value / maxValue) * 100, 8);

            return (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <View style={styles.labelGroup}>
                    <Text style={styles.label} numberOfLines={1}>
                      {item.label}
                    </Text>
                    {item.helper ? (
                      <Text style={styles.helper} numberOfLines={1}>
                        {item.helper}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.value}>{formatValue(item.value)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.bar, { width: `${widthPercent}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: themeFonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#3B0A24',
  },
  rows: {
    gap: 13,
  },
  row: {
    gap: 7,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  labelGroup: {
    flex: 1,
  },
  label: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 14,
    fontWeight: '700',
    color: '#3B0A24',
  },
  helper: {
    fontFamily: themeFonts.body,
    marginTop: 2,
    fontSize: 12,
    color: '#8A4562',
  },
  value: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
  },
  track: {
    overflow: 'hidden',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#FCE7F3',
  },
  bar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#DB2777',
  },
  emptyBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF7FB',
  },
  emptyText: {
    fontFamily: themeFonts.bodyStrong,
    fontSize: 13,
    fontWeight: '700',
    color: '#8A4562',
  },
});
