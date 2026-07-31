import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useMyTeam } from '../../admin/hooks/useTeam';
import { getInitials } from '../../utils/getInitials';

export function MyTeamScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const teamQuery = useMyTeam();
  const team = teamQuery.data ?? [];

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>My Team</Text>
        <Text style={styles.subheading}>Employees who report to you</Text>

        {teamQuery.isLoading ? (
          <Loader label="Loading your team..." />
        ) : team.length === 0 ? (
          <EmptyState
            icon="account-group-outline"
            title="No team members yet"
            message="Employees will appear here once they register and pick you as their team lead."
          />
        ) : (
          <Card padded={false}>
            {team.map((member, index) => (
              <View key={member.id} style={[styles.row, index === team.length - 1 && styles.rowLast]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{member.name}</Text>
                  <Text style={styles.meta}>
                    {member.department} · {member.id}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    heading: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
    },
    subheading: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: 2,
      marginBottom: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textInverse,
    },
    name: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    meta: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
  });
}
